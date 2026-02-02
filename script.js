document.addEventListener('DOMContentLoaded', () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = new Date().toLocaleDateString('tr-TR', options);
    fetchNews();
});

async function fetchNews() {
    const grid = document.getElementById('news-grid');
    
    try {
        // Cache sorununu çözmek için tarih ekliyoruz
        const response = await fetch('articles.json?t=' + new Date().getTime());
        if (!response.ok) throw new Error('Dosya okunamadı');
        
        const articles = await response.json();
        grid.innerHTML = '';

        if (!articles || articles.length === 0) {
            grid.innerHTML = '<p style="text-align:center;">Henüz haber girilmemiş.</p>';
            return;
        }

        articles.forEach(article => {
            const card = document.createElement('div');
            card.className = 'news-card';
            
            // Resim yoksa placeholder
            const imgUrl = (article.image && !article.image.startsWith('{')) ? article.image : 'https://via.placeholder.com/600x300?text=Haber';

            // Link Kontrolü: Link varsa butonu oluştur, yoksa boş bırak
            let linkButton = '';
            if (article.originalLink && article.originalLink.length > 5 && article.originalLink !== '#') {
                linkButton = `<a href="${article.originalLink}" target="_blank" class="read-more">Habere Git <i class="fas fa-external-link-alt"></i></a>`;
            }

            // Metni formatla (Satır başlarını paragraf yap)
            const formattedContent = article.content ? article.content.replace(/\n/g, '<br><br>') : 'İçerik yok.';

            card.innerHTML = `
                <img src="${imgUrl}" alt="${article.title}" class="news-img" onerror="this.src='https://via.placeholder.com/600x300?text=Resim+Yok'">
                <div class="news-content">
                    <div class="news-date">${formatDate(article.publishDate)}</div>
                    <h3 class="news-title">${article.title}</h3>
                    <div class="news-text">${formattedContent}</div>
                    <div style="margin-top:15px;">
                        ${linkButton}
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        grid.innerHTML = '<p style="text-align:center;">Haberler yüklenemedi.</p>';
    }
}

function formatDate(dateString) {
    if(!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR') + ' ' + date.toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'});
    } catch(e) { return ''; }
}
