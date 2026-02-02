document.addEventListener('DOMContentLoaded', () => {
    // Tarihi Ayarla
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = new Date().toLocaleDateString('tr-TR', options);

    // Haberleri Çek
    fetchNews();
});

async function fetchNews() {
    const grid = document.getElementById('news-grid');
    
    try {
        // Cache sorununu önlemek için tarih parametresi ekledik
        const response = await fetch('articles.json?t=' + new Date().getTime());
        
        if (!response.ok) throw new Error('Veri çekilemedi');
        
        const articles = await response.json();
        
        // Yükleniyor yazısını temizle
        grid.innerHTML = '';

        if (articles.length === 0) {
            grid.innerHTML = '<p style="text-align:center; width:100%;">Henüz haber girilmemiş.</p>';
            return;
        }

        // Haberleri döngüyle oluştur
        articles.forEach(article => {
            const card = document.createElement('div');
            card.className = 'news-card';
            
            // Eğer resim yoksa varsayılan resim kullan
            const imageSrc = article.image || 'https://via.placeholder.com/400x200?text=Haber';

            card.innerHTML = `
                <img src="${imageSrc}" alt="${article.title}" class="news-img" onerror="this.src='https://via.placeholder.com/400x200?text=Resim+Yok'">
                <div class="news-content">
                    <div class="news-date"><i class="far fa-clock"></i> ${formatDate(article.publishDate)}</div>
                    <h3 class="news-title">${article.title}</h3>
                    <p class="news-excerpt">${article.content.substring(0, 100)}...</p>
                    <a href="${article.originalLink}" target="_blank" class="read-more">Devamını Oku <i class="fas fa-arrow-right"></i></a>
                </div>
            `;
            grid.appendChild(card);
        });

    } catch (error) {
        console.error('Hata:', error);
        grid.innerHTML = '<p style="text-align:center; color:red;">Haberler yüklenirken bir hata oluştu.</p>';
    }
}

function formatDate(dateString) {
    if(!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR') + ' ' + date.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'});
}
