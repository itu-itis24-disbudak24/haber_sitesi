document.addEventListener('DOMContentLoaded', () => {
    // 1. Tarihi Ayarla (Türkçe Format)
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        dateElement.textContent = new Date().toLocaleDateString('tr-TR', options);
    }
    
    // 2. Haberleri Çekmeye Başla
    fetchNews();
});

async function fetchNews() {
    const grid = document.getElementById('news-grid');
    
    try {
        // --- CACHE (ÖNBELLEK) ÇÖZÜMÜ ---
        // '?t=' + new Date().getTime() ekleyerek tarayıcının eski dosyayı okumasını engelliyoruz.
        // Her seferinde taze veri çekilir.
        const response = await fetch('articles.json?t=' + new Date().getTime());
        
        if (!response.ok) {
            throw new Error('JSON dosyası bulunamadı veya okunamadı.');
        }
        
        const articles = await response.json();
        
        // Önceki yükleniyor yazısını temizle
        grid.innerHTML = '';

        // Eğer hiç haber yoksa mesaj göster
        if (!articles || articles.length === 0) {
            grid.innerHTML = '<p style="text-align:center; width:100%;">Henüz haber girilmemiş.</p>';
            return;
        }

        // --- HABER KARTLARINI OLUŞTURMA ---
        articles.forEach(article => {
            const card = document.createElement('div');
            card.className = 'news-card';
            
            // --- RESİM KONTROLÜ ---
            // Eğer resim linki "{...}" gibi kod içeriyorsa veya boşsa placeholder kullan
            let imgUrl = article.image;
            if (!imgUrl || imgUrl.startsWith('{') || imgUrl.length < 5) {
                imgUrl = 'https://via.placeholder.com/600x300?text=Haber+Gorseli';
            }

            // --- LİNK BUTONU KONTROLÜ ---
            // Link boşsa veya hatalıysa '#' koy ama butonu yine de göster
            let linkUrl = article.originalLink;
            if (!linkUrl || linkUrl === '[]' || linkUrl.startsWith('{')) {
                linkUrl = '#'; // Tıklanınca sayfanın başına atar
            }

            // --- İÇERİK FORMATLAMA ---
            // Satır sonlarını (Enter tuşunu) HTML paragraf boşluğuna çevirir (<br>)
            const formattedContent = article.content 
                ? article.content.replace(/\n/g, '<br><br>') 
                : 'İçerik bulunamadı.';

            // Kartın HTML yapısı
            card.innerHTML = `
                <div class="news-img-container">
                    <img 
                        src="${imgUrl}" 
                        alt="${article.title}" 
                        class="news-img" 
                        onerror="this.src='https://via.placeholder.com/600x300?text=Resim+Yuklenemedi'"
                    >
                </div>
                <div class="news-content">
                    <div class="news-date">
                        <i class="far fa-clock"></i> ${formatDate(article.publishDate)}
                    </div>
                    <h3 class="news-title">${article.title}</h3>
                    
                    <div class="news-text">
                        ${formattedContent}
                    </div>
                    
                    <div style="margin-top:20px;">
                        <a href="${linkUrl}" target="_blank" class="read-more">
                            Kaynağa Git <i class="fas fa-external-link-alt"></i>
                        </a>
                    </div>
                </div>
            `;
            
            // Kartı sayfaya ekle
            grid.appendChild(card);
        });

    } catch (error) {
        console.error('Hata Detayı:', error);
        grid.innerHTML = '<p style="text-align:center; color:red;">Haberler yüklenirken bir sorun oluştu.</p>';
    }
}

// --- YARDIMCI TARİH FONKSİYONU ---
function formatDate(dateString) {
    if(!dateString) return '';
    try {
        const date = new Date(dateString);
        // Örnek çıktı: 2 Şubat 2026 14:30
        return date.toLocaleDateString('tr-TR', {
            day: 'numeric', 
            month: 'long', 
            year: 'numeric'
        }) + ' ' + date.toLocaleTimeString('tr-TR', {
            hour: '2-digit', 
            minute:'2-digit'
        });
    } catch(e) { 
        return ''; 
    }
}
