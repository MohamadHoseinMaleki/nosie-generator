import { SerialPort } from "serialport";

export class SerialPortHandler {
  private port: SerialPort | null = null;
  private dataListener: ((data: string) => void) | null = null;
  private buffer: string = ""; // ذخیره داده‌های دریافتی که ممکن است ناقص باشند

  async listPorts() {
    return SerialPort.list();
  }

  connect(path: string, baudRate = 115200): Promise<string> {
    return new Promise((resolve, reject) => {
      this.port = new SerialPort({ path, baudRate });

      this.port.on("open", () => {
        console.log(`Connected to ${path}`);
        resolve(`Connected to ${path}`);
      });

      this.port.on("error", (err) => {
        console.error(`Error connecting to port: ${err.message}`);
        reject(err);
      });

      this.port.on("close", () => {
        console.log("Port closed");
      });

      this.port.on("data", (data) => {
        this.buffer += data.toString(); // اضافه کردن داده به بافر

        // بررسی اگر پکت کامل است (پایان آن "ENDOFPKT" باشد)
        while (this.buffer.includes("ENDOFPKT")) {
          const packetEndIndex = this.buffer.indexOf("ENDOFPKT") + "ENDOFPKT".length;
          const completePacket = this.buffer.substring(0, packetEndIndex); // استخراج پکت کامل
          this.buffer = this.buffer.substring(packetEndIndex); // حذف پکت پردازش‌شده از بافر

          console.log(`Complete Packet Received: ${completePacket}`);

          if (this.dataListener) {
            this.dataListener(completePacket);
          }
        }
      });
    });
  }

  disconnect(): void {
    if (this.port) {
      this.port.close((err) => {
        if (err) {
          console.error(`Error closing port: ${err.message}`);
        } else {
          console.log("Port closed successfully");
        }
      });
      this.port = null;
    }
  }

  write(data: string): void {
    if (this.port) {
      this.port.write(data, (err) => {
        if (err) {
          console.error(`Error writing to port: ${err.message}`);
        } else {
          console.log(`Data sent: ${data}`);
        }
      });
    } else {
      console.warn("No port is connected");
    }
  }

  async portInfo(): Promise<SerialPort | null> {
    return this.port;
  }

  onData(listener: (data: string) => void): void {
    this.dataListener = listener;
  }

  clearDataListener(): void {
    this.dataListener = null;
  }
}
