function generateQRCode() {
    let link = document.getElementById('link').value;
    if (!link) {
        alert('Digite um link válido!');
        return;
    }
    document.getElementById('qrcode').innerHTML = "";
    let qr = new QRCode(document.getElementById('qrcode'), {
        text: link,
        width: 200,
        height: 200
    });

    document.getElementById('qrcode-container').style.display = 'block';
    setTimeout(() => {
        document.getElementById('downloadBtn').style.display = 'block';
    }, 500);

}

function downloadQRCode() {
    let qrCanvas = document.querySelector('#qrcode canvas');
    let link = document.createElement('a');
    link.href = qrCanvas.toDataURL("image/png");
    link.download = "qrcode.png";
    link.click();
}