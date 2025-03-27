import ActionButtons from "@renderer/components/common/action-buttons";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@renderer/components/ui/card";
import { Input } from "@renderer/components/ui/input";
import { Switch } from "@renderer/components/ui/swtich";
import { useDeviceSettings } from "@renderer/hooks/state/use-device-settings";
import { useEffect, useState } from "react";

const FilteredNoisePage = (): JSX.Element => {
  const { data, onChange } = useDeviceSettings();
  const [switchState, setSwitchState] = useState(data.FNOISE.SHFENBL === 1);

  useEffect(() => {
    if (data.FNOISE) {
      processPacket(`FNOISE *SHFENBL$$${data.FNOISE.SHFENBL}`);
    }
  }, [data.FNOISE.SHFENBL]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtered Noise</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-5">
        <label className="text-sm font-medium">Bandwidth</label>
        <select
          value={data.FNOISE.NOISEBW}
          onChange={(e) => {
            onChange({ ...data, FNOISE: { ...data.FNOISE, NOISEBW: +e.target.value } });
          }}
          className="rounded-md border px-3 py-2 ring ring-transparent focus-within:outline-none focus-within:ring-primary"
        >
          <option value={56000000}>56000000</option>
          <option value={20000000}>20000000</option>
          <option value={8000000}>8000000</option>
          <option value={5000000}>5000000</option>
          <option value={2000000}>2000000</option>
        </select>
        <div>
          <label className="text-sm font-medium">Center Frequency (Hz)</label>
          <Input
            type="number"
            placeholder="Shift noise (Hz)"
            min={-27500000}
            max={27500000}
            value={data.FNOISE.SHFFREQ}
            onChange={(e) => {
              let value = Number(e.target.value);
              value = Math.max(-27500000, Math.min(27500000, value));
              onChange({ ...data, FNOISE: { ...data.FNOISE, SHFFREQ: value } });
            }}
          />
        </div>
        <div className="flex items-center gap-x-2">
          <Switch
            checked={data.FNOISE.SHFENBL === 1}
            onCheckedChange={(checked) => {
              onChange({ ...data, FNOISE: { ...data.FNOISE, SHFENBL: checked ? 1 : 0 } });
              console.log("Updated SHFENBL:", checked ? 1 : 0);
            }}
          />
          Enable Shift
        </div>
      </CardContent>
      <CardFooter>
        <ActionButtons values={data.FNOISE} type="FNOISE" />
      </CardFooter>
    </Card>
  );
};

export default FilteredNoisePage;

const processPacket = (packet: string) => {
  if (packet.includes("FNOISE *SHFENBL$$1")) {
    useDeviceSettings.getState().onChange({
      ...useDeviceSettings.getState().data,
      FNOISE: { ...useDeviceSettings.getState().data.FNOISE, SHFENBL: 1 },
    });
    console.log("Packet processed: SHFENBL set to 1");
  } else if (packet.includes("FNOISE *SHFENBL$$0")) {
    useDeviceSettings.getState().onChange({
      ...useDeviceSettings.getState().data,
      FNOISE: { ...useDeviceSettings.getState().data.FNOISE, SHFENBL: 0 },
    });
    console.log("Packet processed: SHFENBL set to 0");
  }
};