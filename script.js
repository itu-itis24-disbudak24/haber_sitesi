document.addEventListener('DOMContentLoaded', () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = new Date().toLocaleDateString('tr-TR', options);
    fetchNews();
});

async function fetchNews() {
    const grid = document.getElementById('news-grid');
    try {
        const response = await fetch('articles.json?t=' + new Date().getTime());
        if (!response.ok) throw new Error('Veri çekilemedi');
        const articles = await response.json();
        
        grid.innerHTML = ''; 
        if (articles.length === 0) {
            grid.innerHTML = '<p style="text-align:center; width:100%;">Henüz haber girilmemiş.</p>';
            return;
        }

        articles.forEach(article => {
            const card = document.createElement('div');
            card.className = 'news-card';
            
            // Resim yüklenemezse yedek resim göster
            const img = new Image();
            img.src = article.image;
            img.className = 'news-img';
            img.alt = article.title;
            img.onerror = function() {
                this.src = 'https://via.placeholder.com/600x300?text=Resim+Yüklenemedi';
            };

            // Buton Linki Kontrolü (Link yoksa butonu gizle)
            const buttonHtml = (article.originalLink && article.originalLink !== '#') 
                ? `<a href="${article.originalLink}" target="_blank" class="read-more">Kaynağa Git <i class="fas fa-external-link-alt"></i></a>`
                : '';

            // İçeriği kısalt (Özet göster)
            const summary = article.content.length > 200 ? article.content.substring(0, 200) + '...' : article.content;

            card.innerHTML = `
                <div class="news-img-container">${img.outerHTML}</div>
                <div class="news-content">
                    <div class="news-date"><i class="far fa-clock"></i> ${formatDate(article.publishDate)}</div>
                    <h3 class="news-title">${article.title}</h3>
                    <p class="news-excerpt">${summary}</p>
                    ${buttonHtml}
                </div>
            `;
            grid.appendChild(card);
        });

    } catch (error) {
        console.error('Hata:', error);
        grid.innerHTML = '<p style="text-align:center; color:red;">Haberler yüklenirken hata oluştu.</p>';
    }
}

function formatDate(dateString) {
    if(!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR') + ' ' + date.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'});
    } catch(e) { return ''; }
}
