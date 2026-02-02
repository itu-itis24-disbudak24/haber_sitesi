// newsData.json dosyasından haberleri yüklemek için asenkron fonksiyon
async function loadArticles() {
    const gridContainer = document.getElementById('news-grid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    try {
        // 1. JSON dosyasını fetch ediyoruz (Bu kısım sunucu ortamında düzgün çalışır. Eğer sadece yerel dosyadan okuyacaksanız 'fetch' yerine manuel veri tanımlaması gerekebilir, ancak modern yapı fetch gerektirir.)
        const response = await fetch('articles.json');
        if (!response.ok) {
            throw new Error(`HTTP hatası! Durum: ${response.status}`);
        }
        const articles = await response.json();

        let articlesDisplayed = 0;
        const articlesPerLoad = 2; // Her seferinde yüklenecek haber sayısı

        // Tarih formatlama yardımcı fonksiyonu (YYYY-MM-DD -> DD.MM.YYYY)
        const formatDate = (dateString) => {
            if (!dateString) return 'Tarih Bilinmiyor';
            const options = { year: 'numeric', month: 'long', day: 'numeric', dayPeriod: 'short' };
            return new Date(dateString).toLocaleDateString('tr-TR', options);
        };

        // Haber kartını oluşturup döndüren fonksiyon
        const createArticleElement = (article) => {
            const card = document.createElement('article');
            card.className = 'news-card';
            card.innerHTML = `
                <a href="#article-${article.id}" class="card-link">
                    <div class="card-image">
                        <img src="${article.imageUrl}" alt="${article.title}">
                    </div>
                    <div class="card-content">
                        <span class="card-category">${article.category}</span>
                        <h3 class="card-title">${article.title}</h3>
                        <p class="card-summary">${article.summary}</p>
                    </div>
                    <div class="card-date">
                        Yayınlanma Tarihi: ${formatDate(article.publishDate)}
                    </div>
                </a>
            `;
            return card;
        };

        // Başlangıçta ilk haberleri yükle
        const loadInitialArticles = () => {
            const articlesToDisplay = articles.slice(articlesDisplayed, articlesDisplayed + articlesPerLoad);
            
            if (articlesToDisplay.length === 0) {
                gridContainer.innerHTML = '<p>Yüklenecek daha fazla haber bulunmamaktadır.</p>';
                loadMoreBtn.style.display = 'none';
                return;
            }

            articlesToDisplay.forEach(article => {
                gridContainer.appendChild(createArticleElement(article));
            });

            articlesDisplayed += articlesToDisplay.length;

            // Tüm haberler yüklendiyse butonu gizle
            if (articlesDisplayed >= articles.length) {
                loadMoreBtn.style.display = 'none';
            }
        };

        // "Daha Fazla Yükle" butonuna tıklama olay dinleyicisi
        loadMoreBtn.addEventListener('click', loadInitialArticles);

        // Sayfa yüklendiğinde ilk grubu yükle
        loadInitialArticles();

    } catch (error) {
        console.error("Haberler yüklenirken bir hata oluştu:", error);
        gridContainer.innerHTML = `<p class="error-message">Haberler yüklenemedi. Lütfen daha sonra tekrar deneyin. (${error.message})</p>`;
        loadMoreBtn.style.display = 'none';
    }
}

// Sayfa yüklendiğinde çalışacak diğer fonksiyonlar
document.addEventListener('DOMContentLoaded', () => {
    // 1. Haberleri yükle
    loadArticles();

    // 2. Footer'daki yılı güncelle
    document.getElementById('currentYear').textContent = new Date().getFullYear();
});