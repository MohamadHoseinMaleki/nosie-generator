import ActionButtons from "@renderer/components/common/action-buttons";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@renderer/components/ui/card";
import { useDeviceSettings } from "@renderer/hooks/state/use-device-settings";

const BarragePage = (): JSX.Element => {
  const { data, onChange } = useDeviceSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Barrage </CardTitle>
        {/* <CardDescription>Change barrage frequencies</CardDescription> */}
      </CardHeader>
      <CardContent className="grid grid-cols-1">
        <label htmlFor="frequency0" className="mb-2 text-sm font-semibold">
          Number of Carriers
        </label>
        <select
          value={data.BARAGE.BNUMBER}
          onChange={(e) => {
            onChange({ ...data, BARAGE: { ...data.BARAGE, BNUMBER: +e.target.value } });
          }}
          className="rounded-md border px-3 py-2 ring ring-transparent focus-within:outline-none focus-within:ring-primary"
        >
          {/* <option value={2}>2</option>
          <option value={4}>4</option> */}
          <option value={8}>8</option>
          <option value={16}>16</option>
          <option value={32}>32</option>
          <option value={64}>64</option>
          <option value={128}>128</option>
        </select>
      </CardContent>
      <CardFooter>
        <ActionButtons values={{ ...data.BARAGE }} type="BARAGE" />
      </CardFooter>
    </Card>
  );
};
export default BarragePage;
