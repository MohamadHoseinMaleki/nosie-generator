import { createPacket } from "@renderer/helper/packet";
import { cn } from "@renderer/lib/utils";
import { useEffect, useState, useRef } from "react";

interface Props extends React.ComponentProps<"div"> {
  value: number;
  isConnected: boolean;
  onConnectionLost: () => void;
}

const PerformanceIndicator: React.FC<Props> = ({ value, isConnected, onConnectionLost, className, ...props }) => {
  console.log("PerformanceIndicator rendered!"); // بررسی رندر شدن کامپوننت

  useEffect(() => {
    console.log("PerformanceIndicator value:", value);
  }, [value]);

  const [isDisconnected, setIsDisconnected] = useState(false);
  const lastRequestTime = useRef<number | null>(null); // زمان آخرین درخواست
  const lastResponseTime = useRef<number | null>(null); // زمان آخرین پاسخ
  const responseReceived = useRef<boolean>(false); // فلگ برای بررسی دریافت پاسخ
  const alertShown = useRef<boolean>(false); // فلگ برای بررسی نمایش alert

  // تابع برای ارسال درخواست
  const updatePower = async () => {
    const portInfo = await window.context.serialPort.portInfo();

    if (portInfo) {
      const packet = createPacket("GET", "DPOWER", "TXPOWER", ""); // ایجاد پکت
      window.context.serialPort.write(packet); // ارسال پکت
      lastRequestTime.current = Date.now(); // ذخیره زمان ارسال درخواست
      responseReceived.current = false; // فلگ را روی false تنظیم کنید
    }
  };

  useEffect(() => {
    if (!isConnected) {
      setIsDisconnected(false);
      lastRequestTime.current = null;
      lastResponseTime.current = null;
      responseReceived.current = false;
      alertShown.current = false; // بازنشانی فلگ alert
      return;
    }

    // ارسال درخواست به صورت دوره‌ای
    const intervalId = setInterval(() => {
      updatePower();
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isConnected]);

  useEffect(() => {
    if (!isConnected) {
      setIsDisconnected(false);
      return;
    }

    // شبیه‌سازی دریافت پاسخ از دستگاه
    const handleData = (rawData: string) => {
      try {
        // بررسی اینکه آیا داده‌های دریافتی شامل پاسخ معتبر هستند
        if (rawData.trim().length > 0) {
          responseReceived.current = true; // پاسخ دریافت شده است
          lastResponseTime.current = Date.now(); // زمان آخرین پاسخ را ذخیره کنید
          setIsDisconnected(false); // اطمینان از اینکه وضعیت قطع ارتباط برطرف شود
          alertShown.current = false; // بازنشانی فلگ alert
        }
      } catch (error) {
        console.error("Error processing response data:", error);
      }
    };

    // اضافه کردن شنونده برای دریافت داده‌ها
    window.context.serialPort.onData(handleData);

    return () => {
      window.context.serialPort.removeOnData(); // حذف شنونده داده‌ها
    };
  }, [isConnected]);

  useEffect(() => {
    if (!isConnected) return;

    // بررسی وضعیت ارتباط
    const checkConnection = setInterval(() => {
      if (lastRequestTime.current !== null && lastResponseTime.current !== null) {
        const currentTime = Date.now();
        const elapsedTimeSinceLastResponse = currentTime - lastResponseTime.current;

        // اگر بیش از 6 ثانیه از آخرین پاسخ گذشته باشد
        if (elapsedTimeSinceLastResponse > 100000) {
          if (!isDisconnected && !alertShown.current) {
            setIsDisconnected(true);
            onConnectionLost();
            alert("Connection lost! No response from device.");
            alertShown.current = true; // تنظیم فلگ alert به true
          }
        }
      } else if (lastRequestTime.current !== null && lastResponseTime.current === null) {
        // اگر هیچ پاسخی دریافت نشده باشد
        const currentTime = Date.now();
        const elapsedTimeSinceLastRequest = currentTime - lastRequestTime.current;

        if (elapsedTimeSinceLastRequest > 100000) {
          if (!isDisconnected && !alertShown.current) {
            setIsDisconnected(true);
            onConnectionLost();
            alert("Connection lost! No response from device.");
            alertShown.current = true; // تنظیم فلگ alert به true
          }
        }
      }
    }, 1000);

    return () => clearInterval(checkConnection);
  }, [isConnected]);

  const heightPercentage = Math.max(0, Math.min(100, Math.floor(((value + 90) / 110) * 100)));

  return (
    <div
      className={cn(
        "relative mb-10 flex h-36 w-24 shrink-0 overflow-hidden rounded-lg border-4",
        className,
        isDisconnected ? "border-red-600" : "border-slate-700",
      )}
      {...props}
    >
      <div
        className={cn(
          "absolute bottom-0 w-full transition-all duration-300",
          value > -10 ? "bg-green-600" : value > -50 ? "bg-yellow-500" : "bg-red-600",
        )}
        style={{ 
          height: `${heightPercentage}%`,
        }}
      />
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-bold text-black">
        {value}
      </span>
    </div>
  );
};

export default PerformanceIndicator;