import { API_ROOT } from "../api";
import "./ProductBarcode.css";

export default function ProductBarcode({ productId, productName }) {
  const barcodeUrl = `${API_ROOT}/api/products/${productId}/barcode_image/`;

  function handlePrint() {
    // Barkodu ayrı bir sekmede, sadece görsel dolu bir sayfa olarak açıp
    // tarayıcının yazdırma penceresini otomatik tetikliyoruz. Böylece kullanıcı
    // etiketi yazıcıdan çıkarıp ürünün/rafın üzerine yapıştırabilir.
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head><title>${productName} - Barkod</title></head>
        <body style="display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
          <img src="${barcodeUrl}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  return (
    <div className="product-barcode">
      <img src={barcodeUrl} alt="Ürün barkodu" className="product-barcode__image" />
      <button className="product-barcode__print-btn" onClick={handlePrint}>
        🖨️ Etiketi Yazdır
      </button>
    </div>
  );
}
