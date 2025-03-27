import { Card, CardContent, CardHeader, CardTitle } from "@renderer/components/ui/card";
import { Input } from "@renderer/components/ui/input";
import { Slider } from "@renderer/components/ui/slider";
import { decimalToBinaryArray } from "@renderer/helper/decimal";
import { useDeviceSettings } from "@renderer/hooks/state/use-device-settings";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const Frequency = (): JSX.Element => {
  const { data, onChange } = useDeviceSettings();
  const location = useLocation();
  const [sliderValue, setSliderValue] = useState<number>(0);

  // تابع برای شمارش تعداد تون‌های انتخاب‌شده
  const countSelectedTones = (mSelect: number): number => {
    return decimalToBinaryArray(mSelect).filter((bit) => bit === 1).length;
  };

  // تابع برای تعیین حداقل فرکانس (حداقل تضعیف)
  const getMinFrequency = (): number => {
    if (location.pathname === "/multi-tone") {
      const selectedTones = countSelectedTones(data.MULTON.MSELECT);
      switch (selectedTones) {
        case 1:
          return 15;
        case 2:
          return 18;
        case 3:
          return 20;
        case 4:
          return 21;
        case 5:
          return 22;
        default:
          return 15;
      }
    }

    if (location.pathname === "/barrage") {
      switch (data.BARAGE.BNUMBER) {
        case 128:
          return 15;
        case 64:
          return 12;
        case 32:
          return 9;
        case 16:
          return 6;
        case 8:
          return 3;
        default:
          return 9;
      }
    }

    if (location.pathname === "/filtered-noise") {
      switch (data.FNOISE.NOISEBW) {
        case 56000000:
          return 11;
        case 20000000:
          return 16;
        case 8000000:
          return 14;
        case 5000000:
          return 12;
        case 2000000:
          return 8;
        default:
          return 11; // مقدار پیش‌فرض برای Filtered Noise
      }
    }
    if (location.pathname === "/single-tone") {
      return 15;
    }

    if (location.pathname === "/sweep") {
      return 33;
    }

    if (location.pathname === "/delay-doppler") {
      return 8;
    }

    return 50; // فقط برای حالت‌های ناشناخته
  };

  const minFrequency = getMinFrequency();
  const MAX_TXATTEN = 65; // حداکثر تضعیف

  // تنظیم مقدار اولیه localTXATTEN فقط بر اساس getMinFrequency
  const [localTXATTEN, setLocalTXATTEN] = useState<number>(() => {
    const initialMinFrequency = getMinFrequency();
    let initialTXATTEN = initialMinFrequency; // مستقیماً از minFrequency
    if (location.pathname === "/filtered-noise" && data.FNOISE.NOISEBW === 56000000) {
      initialTXATTEN = 11;
    }
    console.log(
      "Initial Setup - Pathname:",
      location.pathname,
      "NOISEBW:",
      data.FNOISE.NOISEBW,
      "Initial TXATTEN:",
      initialTXATTEN,
      "Min Frequency:",
      initialMinFrequency,
      "data.LOFATT.TXATTEN:",
      data.LOFATT.TXATTEN
    );
    return initialTXATTEN;
  });

  // تابع برای تبدیل مقدار اسلایدر به TXATTEN (معکوس)
  const sliderToTXATTEN = (sliderVal: number, _minVal: number, maxVal: number): number => {
    return maxVal - sliderVal; // از maxVal (65) به minVal کاهش می‌یابد
  };

  // تابع برای تبدیل TXATTEN به مقدار اسلایدر
  const txattenToSlider = (txatten: number, _minVal: number, maxVal: number): number => {
    return maxVal - txatten; // معکوس کردن برای اسلایدر
  };

  // محاسبه درصد پر شدن اسلایدر
  const calculateFillPercentage = (value: number, minValue: number, maxValue: number): string => {
    const percentage = ((value - minValue) / (maxValue - minValue)) * 100;
    return `${percentage}%`;
  };

  const [isFrequencyValid, setIsFrequencyValid] = useState(true);

  // هماهنگی اولیه data.LOFATT.TXATTEN با localTXATTEN موقع مونت
  useEffect(() => {
    if (data.LOFATT.TXATTEN !== localTXATTEN) {
      onChange({ ...data, LOFATT: { ...data.LOFATT, TXATTEN: localTXATTEN } });
      console.log("Initial Mount - TXATTEN synced to:", localTXATTEN);
    }
    const initialSliderValue = txattenToSlider(localTXATTEN, minFrequency, MAX_TXATTEN);
    setSliderValue(initialSliderValue);
  }, []); // فقط موقع مونت

  // تنظیم TXATTEN و اسلایدر هنگام تغییر صفحه یا پارامترهای وابسته
  useEffect(() => {
    const newMinFrequency = getMinFrequency();
    let updatedTXATTEN = localTXATTEN;

    if (updatedTXATTEN < newMinFrequency) {
      updatedTXATTEN = newMinFrequency;
    } else if (updatedTXATTEN > MAX_TXATTEN) {
      updatedTXATTEN = MAX_TXATTEN;
    }

    if (location.pathname === "/filtered-noise" && data.FNOISE.NOISEBW === 56000000) {
      updatedTXATTEN = 11;
    }

    if (updatedTXATTEN !== localTXATTEN) {
      setLocalTXATTEN(updatedTXATTEN);
      onChange({ ...data, LOFATT: { ...data.LOFATT, TXATTEN: updatedTXATTEN } });
      console.log("Updated TXATTEN to:", updatedTXATTEN);
    }

    const newSliderValue = txattenToSlider(updatedTXATTEN, newMinFrequency, MAX_TXATTEN);
    setSliderValue(newSliderValue);
  }, [location.pathname, data.FNOISE.NOISEBW, data.BARAGE.BNUMBER, data.MULTON.MSELECT]);

  // هماهنگی اسلایدر با localTXATTEN
  useEffect(() => {
    const newSliderValue = txattenToSlider(localTXATTEN, minFrequency, MAX_TXATTEN);
    setSliderValue(newSliderValue);
  }, [localTXATTEN, minFrequency]);

  // هماهنگی با مقدار دریافت‌شده از سرور
useEffect(() => {
  const newMinFrequency = getMinFrequency();
  let updatedTXATTEN = data.LOFATT.TXATTEN;

  // محدود کردن مقدار دریافت‌شده بین minFrequency و MAX_TXATTEN
  if (updatedTXATTEN < newMinFrequency) {
    updatedTXATTEN = newMinFrequency;
    onChange({ ...data, LOFATT: { ...data.LOFATT, TXATTEN: updatedTXATTEN } });
  } else if (updatedTXATTEN > MAX_TXATTEN) {
    updatedTXATTEN = MAX_TXATTEN;
    onChange({ ...data, LOFATT: { ...data.LOFATT, TXATTEN: updatedTXATTEN } });
  }

  // آپدیت localTXATTEN و sliderValue
  setLocalTXATTEN(updatedTXATTEN);
  const newSliderValue = txattenToSlider(updatedTXATTEN, newMinFrequency, MAX_TXATTEN);
  setSliderValue(newSliderValue);
  console.log("Server Update - TXATTEN:", updatedTXATTEN, "Slider Value:", newSliderValue);
}, [data.LOFATT.TXATTEN, minFrequency]); // وابستگی به data.LOFATT.TXATTEN و minFrequency

  useEffect(() => {
    const freq = data.LOFATT.LOFRQCY;
    setIsFrequencyValid(freq >= 150000000 && freq <= 5500000000);
  }, [data.LOFATT.LOFRQCY]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>RF Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Power Level
        </label>
        <div className="relative w-full">
          <div className="mb-2 flex items-center justify-between">
            {/* "Min" نشان‌دهنده حداکثر تضعیف (65)، "Max" نشان‌دهنده حداقل تضعیف (minFrequency) */}
            <span className="text-xs text-gray-500">Min</span>
            <span className="text-xs text-gray-500">Max</span>
          </div>

          <Slider
            value={[sliderValue]}
            onValueChange={(values) => {
              const newTXATTEN = sliderToTXATTEN(values[0], minFrequency, MAX_TXATTEN);
              setLocalTXATTEN(newTXATTEN);
              onChange({ ...data, LOFATT: { ...data.LOFATT, TXATTEN: newTXATTEN } });
              setSliderValue(values[0]);
            }}
            min={0} // معادل MAX_TXATTEN (حداکثر تضعیف)
            max={MAX_TXATTEN - minFrequency} // معادل minFrequency (حداقل تضعیف)
            step={1}
            className="w-full"
          />

          <div
            className="absolute left-0 top-0 h-2 rounded-full"
            style={{
              width: calculateFillPercentage(sliderValue, 0, MAX_TXATTEN - minFrequency),
            }}
          ></div>
        </div>
        <div className="mt-5">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Frequency (Hz)
          </label>
          <Input
            type="number"
            placeholder="frequency (Hz)"
            min={150000000}
            max={5500000000}
            value={data.LOFATT.LOFRQCY || ""} // اجازه می‌ده پاک بشه
            onChange={(e) => {
              const value = e.target.value === "" ? "" : Number(e.target.value); // اجازه پاک کردن
              onChange({ ...data, LOFATT: { ...data.LOFATT, LOFRQCY: value } });
            }}
            className={!isFrequencyValid ? "border-red-500" : ""}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default Frequency;