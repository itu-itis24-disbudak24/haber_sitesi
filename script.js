document.addEventListener('DOMContentLoaded', () => {
    // Tarihi güncelle
    const dateEl = document.getElementById('current-date');
    if (dateEl) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.textContent = new Date().toLocaleDateString('tr-TR', options);
    }
    
    fetchNews();
});

async function fetchNews() {
    const grid = document.getElementById('news-grid');
    grid.innerHTML = '<p style="text-align:center;">Haberler yükleniyor...</p>';

    try {
        // 1. Dosyayı Çek (Cache önlemek için zaman damgası ekledik)
        const response = await fetch('articles.json?t=' + new Date().getTime());
        
        if (!response.ok) {
            throw new Error(`Dosya bulunamadı! (Hata Kodu: ${response.status})`);
        }

        // 2. Veriyi Oku
        const rawData = await response.json();
        console.log("Ham Veri:", rawData); // Konsoldan kontrol etmek için

        // 3. VERİ AVLA (Veri nerede saklanıyor?)
        let articles = [];

        // SENARYO A: Veri direkt liste olarak gelmiş (En temizi)
        if (Array.isArray(rawData)) {
            // Kontrol et: Bu listenin içinde haber mi var, yoksa başka bir paket mi?
            if (rawData.length > 0 && rawData[0].articlesJsonContent) {
                // n8n'in yaptığı paketleme hatası: [{ articlesJsonContent: "[...]" }]
                try {
                    articles = JSON.parse(rawData[0].articlesJsonContent);
                } catch (e) {
                    console.error("Paket açma hatası:", e);
                }
            } else {
                // Direkt haber listesi
                articles = rawData;
            }
        } 
        // SENARYO B: Veri bir obje olarak gelmiş { "articlesJsonContent": "[...]" }
        else if (typeof rawData === 'object' && rawData.articlesJsonContent) {
            try {
                if (Array.isArray(rawData.articlesJsonContent)) {
                    articles = rawData.articlesJsonContent;
                } else {
                    articles = JSON.parse(rawData.articlesJsonContent);
                }
            } catch (e) {
                console.error("String parse hatası:", e);
            }
        }

        // 4. SON KONTROL (Hala liste değilse hata ver)
        if (!Array.isArray(articles)) {
            grid.innerHTML = `<p style="text-align:center; color:red;">Veri formatı hatalı. (Gelen: ${typeof articles})</p>`;
            return;
        }

        if (articles.length === 0) {
            grid.innerHTML = '<p style="text-align:center;">Henüz haber girilmemiş.</p>';
            return;
        }

        // 5. KARTLARI BAS (Hata Geçirmez Mod)
        grid.innerHTML = ''; // Yükleniyor yazısını sil

        articles.forEach(article => {
            // --- GÜVENLİK KONTROLLERİ ---
            
            // Link Kontrolü (Dizi mi, yazı mı, null mu?)
            let safeLink = "#";
            if (article.originalLink) {
                if (Array.isArray(article.originalLink)) {
                    safeLink = article.originalLink[0] || "#";
                } else if (typeof article.originalLink === 'string') {
                    safeLink = article.originalLink;
                }
            }
            // Hala bozuksa # yap
            if (safeLink === "null" || safeLink.startsWith("{") || safeLink.length < 2) safeLink = "#";

            // Resim Kontrolü
            let safeImage = "https://via.placeholder.com/600x300?text=Gundem";
            if (article.image) {
                if (Array.isArray(article.image)) {
                    safeImage = article.image[0];
                } else if (typeof article.image === 'string' && article.image.length > 5) {
                    safeImage = article.image;
                }
            }

            // İçerik Kontrolü
            const safeContent = article.content || "İçerik yüklenemedi.";
            const safeTitle = article.title || "Yeni Haber";

            // Kartı Oluştur
            const card = document.createElement('div');
            card.className = 'news-card';
            card.innerHTML = `
                <div class="news-img-container">
                    <img src="${safeImage}" alt="${safeTitle}" class="news-img" onerror="this.src='https://via.placeholder.com/600x300?text=Resim+Yok'">
                </div>
                <div class="news-content">
                    <div class="news-date"><i class="far fa-clock"></i> ${formatDate(article.publishDate)}</div>
                    <h3 class="news-title">${safeTitle}</h3>
                    <div class="news-text">${safeContent}</div>
                    <div style="margin-top:15px;">
                        <a href="${safeLink}" target="_blank" class="read-more">Kaynağa Git <i class="fas fa-external-link-alt"></i></a>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

    } catch (error) {
        console.error('Büyük Hata:', error);
        grid.innerHTML = `<div style="text-align:center; color:red; padding:20px;">
            <h3>Bir hata oluştu</h3>
            <p>${error.message}</p>
            <small>Lütfen geliştirici konsolunu (F12) kontrol edin.</small>
        </div>`;
    }
}

function formatDate(dateString) {
    if(!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {hour:'2-digit', minute:'2-digit'});
    } catch(e) { return ''; }
}
