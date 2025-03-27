import ActionButtons from "@renderer/components/common/action-buttons";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@renderer/components/ui/card";
import { Input } from "@renderer/components/ui/input";
import { Switch } from "@renderer/components/ui/swtich";
import { useDeviceSettings } from "@renderer/hooks/state/use-device-settings";
import { useEffect, useState } from "react";

const SweepPage = (): JSX.Element => {
  const { data, onChange } = useDeviceSettings();
  const [isValid, setIsValid] = useState(true);
  const [isSweepTimeValid, setIsSweepTimeValid] = useState(true);
  const [sweepTimeInput, setSweepTimeInput] = useState<string | undefined>(
    data.SWEEPF.SWPTIME !== undefined ? (data.SWEEPF.SWPTIME * 1000).toString() : undefined,
  );
  const [displayValue, setDisplayValue] = useState<string | undefined>(sweepTimeInput); // برای نمایش
  const formatNumber = (value: string): string => {
    if (!value) return value; // اگه مقدار خالیه، همونو برگردون
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    // اگه عدد خیلی کوچیکه، همون مقدار خام رو برگردون
    if (num < 0.001) return value;
    return num.toFixed(5).replace(/\.?0+$/, ""); // حداکثر 5 رقم اعشار و حذف صفرهای اضافی
  };
  const calculateRange = (minFreq: number, maxFreq: number, freqStep: number) => {
    if (freqStep === 0) return 0;
    const constant = (Math.pow(2, 16) - 1) / (61.44 * Math.pow(10, 6));
    let calculatedValue = ((maxFreq - minFreq) / freqStep) * constant;
    return Math.floor(Number(calculatedValue.toString().slice(0, 8)));
  };

  const processPacket = (packet: string) => {
    if (packet.includes("SWEEPF *REVERSE$$1")) {
      useDeviceSettings.getState().onChange({
        ...useDeviceSettings.getState().data,
        SWEEPF: { ...useDeviceSettings.getState().data.SWEEPF, REVERSE: 1 },
      });
      console.log("Packet processed: REVERSE set to 1");
    } else if (packet.includes("SWEEPF *REVERSE$$0")) {
      useDeviceSettings.getState().onChange({
        ...useDeviceSettings.getState().data,
        SWEEPF: { ...useDeviceSettings.getState().data.SWEEPF, REVERSE: 0 },
      });
      console.log("Packet processed: REVERSE set to 0");
    }
  };

  useEffect(() => {
    if (data.SWEEPF) {
      processPacket(`SWEEPF *REVERSE$$${data.SWEEPF.REVERSE}`);
    }
  }, [data.SWEEPF.REVERSE]);

  useEffect(() => {
    setIsValid(data.SWEEPF.MINFREQ <= data.SWEEPF.MAXFREQ);
  }, [data.SWEEPF.MINFREQ, data.SWEEPF.MAXFREQ]);

  const clampValue = (value: number, min: number, max: number) => {
    return Math.max(min, Math.min(max, value));
  };

  // useEffect(() => {
  //   setSweepTimeInput(data.SWEEPF.SWPTIME !== undefined ? (data.SWEEPF.SWPTIME * 1000).toString() : "");
  //   const maxRange = calculateRange(data.SWEEPF.MINFREQ, data.SWEEPF.MAXFREQ, data.SWEEPF.STPFREQ) * 1000;
  //   const sweepTimeMs = data.SWEEPF.SWPTIME !== undefined ? data.SWEEPF.SWPTIME * 1000 : undefined;
  //   setIsSweepTimeValid(sweepTimeMs !== undefined && sweepTimeMs >= 0.00001 && sweepTimeMs <= maxRange);
  // }, [data.SWEEPF.SWPTIME, data.SWEEPF.MINFREQ, data.SWEEPF.MAXFREQ, data.SWEEPF.STPFREQ]);

  useEffect(() => {
    setSweepTimeInput(data.SWEEPF.SWPTIME !== undefined ? (data.SWEEPF.SWPTIME * 1000).toString() : "");
    const maxRange = calculateRange(data.SWEEPF.MINFREQ, data.SWEEPF.MAXFREQ, data.SWEEPF.STPFREQ) * 1000;
    const sweepTimeMs = data.SWEEPF.SWPTIME !== undefined ? data.SWEEPF.SWPTIME * 1000 : undefined;
    setIsSweepTimeValid(sweepTimeMs !== undefined && sweepTimeMs >= 0.00001 && sweepTimeMs <= maxRange);
  }, [data.SWEEPF.SWPTIME, data.SWEEPF.MINFREQ, data.SWEEPF.MAXFREQ, data.SWEEPF.STPFREQ]);

  useEffect(() => {
    const newSweepTimeMs = data.SWEEPF.SWPTIME !== undefined ? (data.SWEEPF.SWPTIME * 1000).toString() : "";
    const formattedValue = formatNumber(newSweepTimeMs);
    setSweepTimeInput(newSweepTimeMs);
    setDisplayValue(formattedValue);
  
    const maxRange = calculateRange(data.SWEEPF.MINFREQ, data.SWEEPF.MAXFREQ, data.SWEEPF.STPFREQ) * 1000;
    const sweepTimeMs = data.SWEEPF.SWPTIME !== undefined ? data.SWEEPF.SWPTIME * 1000 : undefined;
    setIsSweepTimeValid(sweepTimeMs !== undefined && sweepTimeMs >= 0.00001 && sweepTimeMs <= maxRange);
  }, [data.SWEEPF.SWPTIME, data.SWEEPF.MINFREQ, data.SWEEPF.MAXFREQ, data.SWEEPF.STPFREQ]);
  
  useEffect(() => {
    let inputStr = sweepTimeInput?.trim() || "";
    const MAX_SWEEP_TIME = 9999999;

    if (inputStr === "" || inputStr === undefined) {
      return;
    }

    const inputAsNumber = parseFloat(inputStr);
    let finalValueInSeconds: number;

    if (isNaN(inputAsNumber) || inputAsNumber < 0.00001 || inputAsNumber > MAX_SWEEP_TIME) {
      setIsSweepTimeValid(false);
      return;
    } else {
      finalValueInSeconds = parseFloat(inputStr) / 1000;
      const limitedValueStr = finalValueInSeconds.toString().slice(0, 10);
      finalValueInSeconds = parseFloat(limitedValueStr);
      setIsSweepTimeValid(true);
    }

    if (data.SWEEPF.SWPTIME !== finalValueInSeconds) {
      onChange({ ...data, SWEEPF: { ...data.SWEEPF, SWPTIME: finalValueInSeconds } });
      console.log("SWPTIME synced on change:", finalValueInSeconds, "Input:", inputStr);
    }
  }, [sweepTimeInput]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sweep</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div>
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            F<sub>min</sub> (Hz)
          </label>
          <Input
            type="number"
            placeholder="Min frequency (Hz)"
            min={-28000000}
            max={28000000}
            step={1}
            value={data.SWEEPF.MINFREQ}
            className={data.SWEEPF.MINFREQ > data.SWEEPF.MAXFREQ ? "border-red-500" : ""}
            onChange={(e) => {
              let value = Number(e.target.value) || 0;
              value = clampValue(value, -28000000, 28000000);
              onChange({ ...data, SWEEPF: { ...data.SWEEPF, MINFREQ: value } });
            }}
          />
        </div>

        <div>
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            F<sub>max</sub> (Hz)
          </label>
          <Input
            type="number"
            placeholder="Max frequency (Hz)"
            min={-28000000}
            max={28000000}
            step={1}
            value={data.SWEEPF.MAXFREQ}
            className={data.SWEEPF.MINFREQ > data.SWEEPF.MAXFREQ ? "border-red-500" : ""}
            onChange={(e) => {
              let value = Number(e.target.value) || 0;
              value = clampValue(value, -28000000, 28000000);
              onChange({ ...data, SWEEPF: { ...data.SWEEPF, MAXFREQ: value } });
            }}
          />
        </div>

        <div>
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Step (Hz)
          </label>
          <Input
            type="number"
            placeholder="Step"
            min={0}
            max={28000000}
            step={1}
            value={data.SWEEPF.STPFREQ}
            onChange={(e) => {
              let value = Number(e.target.value) || 0;
              value = clampValue(value, 0, 28000000);
              onChange({ ...data, SWEEPF: { ...data.SWEEPF, STPFREQ: value } });
            }}
          />
        </div>

        <div>
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Level (0-255)
          </label>
          <Input
            type="number"
            placeholder="Attenuation"
            min={0}
            max={255}
            step={1}
            value={data.SWEEPF.ATTENVL}
            onChange={(e) => {
              let value = Number(e.target.value) || 0;
              value = clampValue(value, 0, 255);
              onChange({ ...data, SWEEPF: { ...data.SWEEPF, ATTENVL: value } });
            }}
          />
        </div>

        <div className="flex items-center gap-x-2">
          <Switch
            checked={data.SWEEPF.REVERSE === 1}
            onCheckedChange={(checked) => {
              onChange({ ...data, SWEEPF: { ...data.SWEEPF, REVERSE: checked ? 1 : 0 } });
            }}
          />
          Reverse Sweep
        </div>

        <div>
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Sweep Time (ms)
          </label>
          <Input
            type="text"
            value={displayValue ?? ""}
            maxLength={7}
            onChange={(e) => {
              let inputValue = e.target.value;
              if (inputValue.length > 7) {
                inputValue = inputValue.slice(0, 7); // محدودیت 7 کاراکتر
              }

              // اعتبارسنجی: فقط اعداد و یک نقطه اعشار مجاز است
              const isValidFormat = /^-?\d*\.?\d*$/.test(inputValue);
              if (!isValidFormat && inputValue !== "") {
                return; // اگه فرمت درست نباشه، تغییر رو قبول نمی‌کنیم
              }

              setSweepTimeInput(inputValue); // مقدار خام ورودی
              setDisplayValue(inputValue); // مقدار نمایشی

              const MAX_SWEEP_TIME = 9999999;
              const numericValue: number | undefined = inputValue === "" ? undefined : parseFloat(inputValue);
              const isValid =
                inputValue !== "" &&
                numericValue !== undefined &&
                !isNaN(numericValue) &&
                numericValue >= 0.00001 &&
                numericValue <= MAX_SWEEP_TIME;

              setIsSweepTimeValid(isValid);

              if (isValid && numericValue !== undefined) {
                // چک کردن undefined
                const finalValueInSeconds = numericValue / 1000;
                const finalValueStr = finalValueInSeconds.toFixed(10); // حداکثر 10 رقم اعشار
                const limitedValue = parseFloat(finalValueStr.slice(0, 12)); // 12 کاراکتر شامل "0." و 10 رقم
                onChange({ ...data, SWEEPF: { ...data.SWEEPF, SWPTIME: limitedValue } });
                console.log("onChange - SWPTIME:", limitedValue, "Input:", inputValue);
              }
            }}
            onBlur={() => {
              let inputStr = sweepTimeInput?.trim() || "";
              const MAX_SWEEP_TIME = 9999999;

              if (inputStr === "" || inputStr === undefined) {
                const defaultValue = 0.00001;
                onChange({ ...data, SWEEPF: { ...data.SWEEPF, SWPTIME: defaultValue / 1000 } });
                setSweepTimeInput(defaultValue.toString());
                setDisplayValue(defaultValue.toString());
                setIsSweepTimeValid(true);
                console.log("onBlur - SWPTIME:", defaultValue / 1000, "Input:", defaultValue);
                return;
              }

              const inputAsNumber = parseFloat(inputStr);
              const isValid = !isNaN(inputAsNumber) && inputAsNumber >= 0.00001 && inputAsNumber <= MAX_SWEEP_TIME;
              if (!isValid) {
                setIsSweepTimeValid(false);
              } else {
                const finalValueInSeconds = inputAsNumber / 1000;
                const finalValueStr = finalValueInSeconds.toFixed(10); // حداکثر 10 رقم اعشار
                const limitedValue = parseFloat(finalValueStr.slice(0, 12)); // 12 کاراکتر شامل "0." و 10 رقم
                onChange({ ...data, SWEEPF: { ...data.SWEEPF, SWPTIME: limitedValue } });
                // نمایش رو با مقدار خام و فرمت‌شده تنظیم می‌کنیم
                const displayStr = formatNumber(inputStr); // استفاده از تابع فرمت
                setDisplayValue(displayStr);
                setIsSweepTimeValid(true);
                console.log("onBlur - SWPTIME:", limitedValue, "Input:", inputStr);
              }
            }}
            className={!isSweepTimeValid ? "border-red-500" : ""}
            disabled={false}
          />
        </div>
      </CardContent>
      <CardFooter>
        <ActionButtons values={data.SWEEPF} type="SWEEPF" isValid={isValid} />
      </CardFooter>
    </Card>
  );
};

export default SweepPage;
