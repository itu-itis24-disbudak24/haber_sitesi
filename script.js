document.addEventListener('DOMContentLoaded', () => {
    // Tarihi ayarla
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateEl = document.getElementById('current-date');
    if (dateEl) dateEl.textContent = new Date().toLocaleDateString('tr-TR', options);
    
    fetchNews();
});

async function fetchNews() {
    const grid = document.getElementById('news-grid');
    
    try {
        // Cache önlemek için zaman damgası ekliyoruz
        const response = await fetch('articles.json?t=' + new Date().getTime());
        
        if (!response.ok) {
            // Dosya yoksa (henüz oluşmadıysa)
            grid.innerHTML = '<p style="text-align:center;">Henüz haber girilmemiş veya dosya oluşturuluyor.</p>';
            return;
        }
        
        // JSON'u okumaya çalış
        let articles;
        try {
            articles = await response.json();
        } catch (e) {
            throw new Error('JSON dosyası bozuk veya hatalı formatta.');
        }

        // Eğer gelen veri liste değilse (örn: { "articlesJsonContent": [...] } ise) düzelt
        if (!Array.isArray(articles)) {
            if (articles.articlesJsonContent) {
                // İç içe geçmiş string ise parse et
                try {
                    articles = JSON.parse(articles.articlesJsonContent);
                } catch (e) {
                    // Belki direkt array'dir ama obje içindedir
                    articles = Object.values(articles)[0]; 
                }
            }
        }

        // Hala dizi değilse hata ver
        if (!Array.isArray(articles)) {
            console.error('Gelen veri:', articles);
            throw new Error('Veri formatı hatalı (Liste bekleniyordu).');
        }

        grid.innerHTML = ''; // Yükleniyor yazısını temizle

        if (articles.length === 0) {
            grid.innerHTML = '<p style="text-align:center;">Henüz haber yok.</p>';
            return;
        }

        // --- KARTLARI OLUŞTUR ---
        articles.forEach(article => {
            const card = document.createElement('div');
            card.className = 'news-card';
            
            // 1. GÜVENLİ RESİM KONTROLÜ
            let imgUrl = article.image;
            // Dizi geldiyse ilkin al
            if (Array.isArray(imgUrl)) imgUrl = imgUrl[0];
            // String değilse veya boşsa placeholder yap
            if (!imgUrl || typeof imgUrl !== 'string' || imgUrl.length < 5 || imgUrl.startsWith('{')) {
                imgUrl = 'https://via.placeholder.com/600x300?text=Gundem';
            }

            // 2. GÜVENLİ LİNK KONTROLÜ (Çökme Engelleyici)
            let linkUrl = article.originalLink;
            // Dizi geldiyse ilkini al (Sorunu çözen satır)
            if (Array.isArray(linkUrl)) linkUrl = linkUrl[0];
            // String değilse veya boşsa '#' yap
            if (!linkUrl || typeof linkUrl !== 'string' || linkUrl.length < 2 || linkUrl.startsWith('{')) {
                linkUrl = '#';
            }

            // 3. İÇERİK KONTROLÜ
            const content = article.content || "İçerik bulunamadı.";

            card.innerHTML = `
                <div class="news-img-container">
                    <img src="${imgUrl}" alt="${article.title}" class="news-img" onerror="this.src='https://via.placeholder.com/600x300?text=Resim+Yok'">
                </div>
                <div class="news-content">
                    <div class="news-date"><i class="far fa-clock"></i> ${formatDate(article.publishDate)}</div>
                    <h3 class="news-title">${article.title}</h3>
                    <div class="news-text">${content}</div>
                    <div style="margin-top:15px;">
                        <a href="${linkUrl}" target="_blank" class="read-more">Kaynağa Git <i class="fas fa-external-link-alt"></i></a>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

    } catch (error) {
        console.error('Hata:', error);
        // Hatayı ekrana detaylı bas ki görelim
        grid.innerHTML = `<p style="text-align:center; color:red;">Bir hata oluştu: ${error.message}</p>`;
    }
}

function formatDate(dateString) {
    if(!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit'});
    } catch(e) { return ''; }
}
