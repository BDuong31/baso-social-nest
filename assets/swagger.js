document.addEventListener("DOMContentLoaded", function() {
    var interval = setInterval(function() {
      var topbarWrapper = document.querySelector('.topbar-wrapper');
      if (topbarWrapper) {
        console.log('Tìm thấy topbar-wrapper');
        console.log(topbarWrapper);
        topbarWrapper.innerHTML = `
            <img src="http://localhost:3000/assets/logo.png" alt="Baso Spark Logo" style="width: 50px; height: 50px; margin: 10px 0;">
            <h3 style="color: white">Baso Spark</h3>
        `;

        clearInterval(interval);  // Dừng kiểm tra sau khi tìm thấy phần tử
      } else {
        console.log('Không tìm thấy topbar-wrapper');
      }
    }, 100);  // Kiểm tra lại mỗi 100ms
});
