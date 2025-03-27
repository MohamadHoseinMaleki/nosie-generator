import ActionButtons from "@renderer/components/common/action-buttons";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@renderer/components/ui/card";
import { Input } from "@renderer/components/ui/input";
import { Switch } from "@renderer/components/ui/swtich";
import { useDeviceSettings } from "@renderer/hooks/state/use-device-settings";
import { useEffect } from "react";

const DelayDopplerPage = (): JSX.Element => {
  const { data, onChange } = useDeviceSettings();

  const processPacket = (packet: string) => {
    if (packet.includes("DELDOP *DELAYEN$$1")) {
      useDeviceSettings.getState().onChange({
        ...useDeviceSettings.getState().data,
        DELDOP: { ...useDeviceSettings.getState().data.DELDOP, DELAYEN: 1 },
      });
      console.log("Packet processed: DELAYEN set to 1");
    } else if (packet.includes("DELDOP *DELAYEN$$0")) {
      useDeviceSettings.getState().onChange({
        ...useDeviceSettings.getState().data,
        DELDOP: { ...useDeviceSettings.getState().data.DELDOP, DELAYEN: 0 },
      });
      console.log("Packet processed: DELAYEN set to 0");
    }

    if (packet.includes("DELDOP *DOPLREN$$1")) {
      useDeviceSettings.getState().onChange({
        ...useDeviceSettings.getState().data,
        DELDOP: { ...useDeviceSettings.getState().data.DELDOP, DOPLREN: 1 },
      });
      console.log("Packet processed: DOPLREN set to 1");
    } else if (packet.includes("DELDOP *DOPLREN$$0")) {
      useDeviceSettings.getState().onChange({
        ...useDeviceSettings.getState().data,
        DELDOP: { ...useDeviceSettings.getState().data.DELDOP, DOPLREN: 0 },
      });
      console.log("Packet processed: DOPLREN set to 0");
    }
  };

  useEffect(() => {
    if (data.DELDOP) {
      processPacket(`DELDOP *DELAYEN$$${data.DELDOP.DELAYEN}`);
      processPacket(`DELDOP *DOPLREN$$${data.DELDOP.DOPLREN}`);
    }
  }, [data.DELDOP.DELAYEN, data.DELDOP.DOPLREN]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Repeater</CardTitle>
        {/* <CardDescription>Change Delay/Doppler frequencies</CardDescription> */}
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-5">
        <div className="flex items-center gap-x-2">
          <Switch
            checked={data.DELDOP.DELAYEN === 1}
            onCheckedChange={(checked) =>
              processPacket(`DELDOP *DELAYEN$$${checked ? 1 : 0}`)
            }
          />
          Enable Delay
        </div>
        <div className="flex items-center gap-x-2">
          <Switch
            checked={data.DELDOP.DOPLREN === 1}
            onCheckedChange={(checked) =>
              processPacket(`DELDOP *DOPLREN$$${checked ? 1 : 0}`)
            }
          />
          Enable Doppler shift
        </div>

        <div>
          <label className="text-sm font-medium">Delay (x 100 us)</label>
          <select
            value={data.DELDOP.DLYVALU / 100}
            onChange={(e) =>
              onChange({ ...data, DELDOP: { ...data.DELDOP, DLYVALU: +e.target.value * 100 } })
            }
            className="block w-full rounded-md border px-3 py-2 ring ring-transparent focus-within:outline-none focus-within:ring-primary"
          >
            {[...Array(15).keys()].map((num) => (
              <option key={num + 1} value={num + 1}>{num + 1}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Doppler (Hz)</label>
          <Input
            type="number"
            placeholder="Doppler Shift (Hz)"
            min={-28000000}
            max={28000000}
            value={data.DELDOP.DOPFREQ}
            // disabled={false}
            onChange={(e) => {
              let value = Math.max(-28000000, Math.min(28000000, Number(e.target.value)));
              onChange({ ...data, DELDOP: { ...data.DELDOP, DOPFREQ: value } });
            }}
          />
        </div>
      </CardContent>
      <CardFooter>
        <ActionButtons values={data.DELDOP} type="DELDOP" />
      </CardFooter>
    </Card>
  );
};

export default DelayDopplerPage;
