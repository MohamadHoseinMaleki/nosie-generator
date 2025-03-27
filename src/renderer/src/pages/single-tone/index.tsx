import ActionButtons from "@renderer/components/common/action-buttons";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@renderer/components/ui/card";
import { Input } from "@renderer/components/ui/input";
import { useDeviceSettings } from "@renderer/hooks/state/use-device-settings";

const SingleTonePage = (): JSX.Element => {
  const { data, onChange } = useDeviceSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Single Tone</CardTitle>
        {/* <CardDescription>Change single tone frequencies</CardDescription> */}
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <label htmlFor="frequency0" className="mb-2 text-sm font-semibold">
          Frequency (Hz)
        </label>
        <Input
          type="number"
          placeholder="frequency (Hz)"
          min={-28000000}
          max={28000000}
          value={data.SINGLE.FREQCY0}
          onChange={(e) => {
            let value = Number(e.target.value);
            // valid range
            if (value < -28000000) {
              value = -28000000;
            } else if (value > 28000000) {
              value = 28000000;
            }
            onChange({ ...data, SINGLE: { ...data.SINGLE, FREQCY0: value } });
          }}
        />
        <label htmlFor="attenuation0" className="mb-2 text-sm font-semibold">
          Level (0-255)
        </label>
        <Input
          type="number"
          placeholder="Attenuation Coefficient"
          min={0}
          max={255}
          value={data.SINGLE.ATTENV0}
          onChange={(e) => {
            let value = Number(e.target.value);
            // Validate the input value
            if (value < 0) {
              value = 0;
            } else if (value > 255) {
              value = 255;
            }
            onChange({ ...data, SINGLE: { ...data.SINGLE, ATTENV0: value } });
          }}
        />
      </CardContent>
      <CardFooter>
        <ActionButtons values={data.SINGLE} type="SINGLE" />
      </CardFooter>
    </Card>
  );
};
export default SingleTonePage;
