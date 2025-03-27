import { Button } from "@renderer/components/ui/button";
import { createPacket } from "@renderer/helper/packet";
import { DeviceSettingType, useDeviceSettings } from "@renderer/hooks/state/use-device-settings";
import { Check, UnplugIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  values: Record<string, any>;
  type: keyof DeviceSettingType;
  isValid?: boolean; // پراپ جدید برای بررسی اعتبار
}

const ActionButtons = ({ values, type, isValid = true }: Props) => {
  const { data, onCancel, onReset, onSubmit } = useDeviceSettings();
  const [previousPSGMode, setPreviousPSGMode] = useState(data.NOISES.PSGMODE);

  const handleSubmit = async () => {
    // چک Fmin و Fmax
    if (!isValid) {
      toast("Error: Fmin value must be less than or equal to Fmax!", {
        icon: <XIcon className="text-red-600" />,
      });
      return;
    }
    // چک Sweep Time
    const MAX_SWEEP_TIME = 9999999;
    const sweepTimeMs = data.SWEEPF.SWPTIME !== undefined ? data.SWEEPF.SWPTIME * 1000 : undefined;
    const isSweepTimeValid = sweepTimeMs !== undefined && sweepTimeMs >= 0.00001 && sweepTimeMs <= MAX_SWEEP_TIME;
    if (!isSweepTimeValid) {
      toast("Error: Sweep Time must be between 0.00001 and 9999999 ms!", {
        icon: <XIcon className="text-red-600" />,
      });
      return;
    }
  
    const port = await window.context.serialPort.portInfo();
    const sleep = (ms: number): Promise<void> => {
      return new Promise((resolve) => setTimeout(resolve, ms));
    };
    if (!port) {
      toast("Port isn't connected", { icon: <UnplugIcon className="text-red-600" /> });
      return;
    }

    // کدهای قبلی بدون تغییر
    window.context.serialPort.write(createPacket("SET", "NOISES", "PSGMODE", "0"));
    window.context.serialPort.write(createPacket("SET", "LOFATT", "TXATTEN", data.LOFATT.TXATTEN));

    try {
      switch (type) {
        case "SWEEPF":
          window.context.serialPort.write(createPacket("SET", "NOISES", "NOISESS", "0"));
          break;
        case "DELDOP":
          window.context.serialPort.write(createPacket("SET", "NOISES", "NOISESS", "1"));
          break;
        case "FNOISE":
          window.context.serialPort.write(createPacket("SET", "NOISES", "NOISESS", "2"));
          break;
        case "MULTON":
          window.context.serialPort.write(createPacket("SET", "NOISES", "NOISESS", "3"));
          break;
        case "SINGLE":
          window.context.serialPort.write(createPacket("SET", "NOISES", "NOISESS", "5"));
          break;
        case "BARAGE":
          window.context.serialPort.write(createPacket("SET", "NOISES", "NOISESS", "4"));
          break;
        default:
          break;
      }

      for (const key in data.LOFATT) {
        window.context.serialPort.write(createPacket("SET", "LOFATT", key, data.LOFATT[key]));
      }

      // window.context.serialPort.write(createPacket("SET", "NOISES", "PSGMODE", data.NOISES.PSGMODE));

      if (data.NOISES.PSGMODE === "2") {
        window.context.serialPort.write(createPacket("SET", "NOISES", "ONDETER", data.NOISES.ONDETER));
        window.context.serialPort.write(createPacket("SET", "NOISES", "OFFDETR", data.NOISES.OFFDETR));
      } else if (data.NOISES.PSGMODE === "3") {
        window.context.serialPort.write(createPacket("SET", "NOISES", "ONSTOCH", data.NOISES.ONSTOCH));
        window.context.serialPort.write(createPacket("SET", "NOISES", "OFFSTOC", data.NOISES.OFFSTOC));
      }

      for (const attr in values) {
        if (values[attr] !== null) {
          window.context.serialPort.write(createPacket("SET", type, attr, values[attr]));
        }
      }
      //SEND IN LAST
      window.context.serialPort.write(createPacket("SET", "NOISES", "PSGMODE", data.NOISES.PSGMODE));
      // تغییر فقط در این بخش
      window.context.serialPort.write(createPacket("GET", "NOISES", "NOISESS", ""));
      await sleep(500); // تأخیر کوتاه برای دریافت پاسخ
      onSubmit(); // فراخوانی بعد از دریافت پاسخ
    } catch (err: any) {
      toast("Data set failed", {
        icon: <XIcon className="text-red-600" />,
      });
    }
  };

  return (
    <div className="grid w-full grid-cols-1 gap-5 lg:grid-cols-3 xl:w-1/2">
      <Button onClick={handleSubmit} className="col-span-1 w-full">
        Submit
      </Button>
      <Button
        variant="destructive"
        onClick={() => {
          onCancel();
        }}
        className="col-span-1 w-full"
      >
        Cancel
      </Button>
      <Button
        variant="secondary"
        onClick={() => {
          onReset();
        }}
        className="col-span-1 w-full"
      >
        Reset
      </Button>
    </div>
  );
};

export default ActionButtons;
