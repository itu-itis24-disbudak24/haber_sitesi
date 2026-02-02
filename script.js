document.addEventListener('DOMContentLoaded', () => {
    // Tarih Ayarı
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = new Date().toLocaleDateString('tr-TR', options);

    fetchNews();
});

async function fetchNews() {
    const grid = document.getElementById('news-grid');
    
    try {
        // Cache önlemek için tarih parametresi ekledik
        const response = await fetch('articles.json?t=' + new Date().getTime());
        if (!response.ok) throw new Error('Veri çekilemedi');
        
        const articles = await response.json();
        
        grid.innerHTML = ''; // Yükleniyor yazısını temizle

        if (articles.length === 0) {
            grid.innerHTML = '<p style="text-align:center; width:100%;">Henüz haber girilmemiş.</p>';
            return;
        }

        articles.forEach(article => {
            const card = document.createElement('div');
            card.className = 'news-card';
            
            // Resim kontrolü
            const imageSrc = (article.image && !article.image.startsWith('{')) ? article.image : 'https://via.placeholder.com/600x300?text=Haber';

            // HTML Şablonu (Buton YOK, Tam Metin VAR)
            card.innerHTML = `
                <img src="${imageSrc}" alt="${article.title}" class="news-img" onerror="this.src='https://via.placeholder.com/600x300?text=Resim+Yok'">
                <div class="news-content">
                    <div class="news-date"><i class="far fa-clock"></i> ${formatDate(article.publishDate)}</div>
                    <h3 class="news-title">${article.title}</h3>
                    <div class="news-full-text">
                        ${formatContent(article.content)}
                    </div>
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

// Paragrafları düzgün göstermek için yardımcı fonksiyon
function formatContent(text) {
    if (!text) return 'İçerik yok.';
    // Satır başlarını <p> etiketiyle değiştirir
    return '<p>' + text.replace(/\n/g, '</p><p>') + '</p>';
}
