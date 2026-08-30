import io

import barcode
from barcode.writer import ImageWriter


def generate_barcode_png(code):
    """Verilen bir stok kodunu (SKU) Code128 formatında barkod PNG görseline çevirir."""
    code128 = barcode.get_barcode_class("code128")
    writer = ImageWriter()
    writer.set_options({
        "module_height": 12.0,
        "font_size": 10,
        "text_distance": 3.0,
        "quiet_zone": 2.0,
    })
    instance = code128(code, writer=writer)

    buffer = io.BytesIO()
    instance.write(buffer)
    buffer.seek(0)
    return buffer