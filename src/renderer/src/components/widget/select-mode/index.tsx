import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@renderer/components/ui/card";
import { Input } from "@renderer/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@renderer/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@renderer/components/ui/toggle-group";
import { useDeviceSettings } from "@renderer/hooks/state/use-device-settings";

const SelectMode = (): JSX.Element => {
  const { data, onChange } = useDeviceSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Output</CardTitle>
        {/* <CardDescription>change device mode</CardDescription> */}
      </CardHeader>
      <CardContent>
        <ToggleGroup
          variant="outline"
          type="single"
          value={data.NOISES.PSGMODE}
          onValueChange={(value) => {
            if (value) {
              onChange({ ...data, NOISES: { ...data.NOISES, PSGMODE: value ? value : data.NOISES.PSGMODE } });
            }
          }}
        >
          <ToggleGroupItem value="0" className="data-[state=on]:bg-primary data-[state=on]:text-accent">
            None
          </ToggleGroupItem>
          <ToggleGroupItem value="1" className="data-[state=on]:bg-primary data-[state=on]:text-accent">
            CW
          </ToggleGroupItem>
          <ToggleGroupItem value="2" className="px-0 data-[state=on]:bg-primary data-[state=on]:text-accent">
            <Popover>
              <PopoverTrigger className="size-full px-3">Pulse</PopoverTrigger>
              <PopoverContent className="flex w-fit items-center gap-x-5">
                <div className="space-y-1">
                  <label>On Time (us)</label>
                  <Input
                    type="number"
                    min={0}
                    max={69900000}
                    value={data.NOISES.ONDETER}
                    placeholder="On Time (us)"
                    onChange={(e) => {
                      let value = Number(e.target.value);
                      // Valid range
                      if (value < 0) {
                        value = 0;
                      } else if (value > 69900000) {
                        value = 69900000;
                      }
                      onChange({ ...data, NOISES: { ...data.NOISES, ONDETER: value } });
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <label>Off Time (us)</label>
                  <Input
                    type="number"
                    min={0}
                    max={69900000}
                    value={data.NOISES.OFFDETR}
                    placeholder="Off Time (us)"
                    onChange={(e) => {
                      let value = Number(e.target.value);
                      // Valid range
                      if (value < 0) {
                        value = 0;
                      } else if (value > 69900000) {
                        value = 69900000;
                      }
                      onChange({ ...data, NOISES: { ...data.NOISES, OFFDETR: value } });
                    }}
                  />
                </div>
              </PopoverContent>
            </Popover>
          </ToggleGroupItem>
          <ToggleGroupItem value="3" className="px-0 data-[state=on]:bg-primary data-[state=on]:text-accent">
            <Popover>
              <PopoverTrigger className="size-full px-3">Random Pulse</PopoverTrigger>
              <PopoverContent className="flex w-fit items-center gap-x-5">
                <div className="space-y-1">
                  <label>On Time (us)</label>
                  <Input
                    type="number"
                    min={0}
                    max={69900000}
                    value={data.NOISES.ONSTOCH}
                    placeholder="On Time (us)"
                    onChange={(e) => {
                      let value = Number(e.target.value);
                      // Valid range
                      if (value < 0) {
                        value = 0;
                      } else if (value > 69900000) {
                        value = 69900000;
                      }
                      onChange({ ...data, NOISES: { ...data.NOISES, ONSTOCH: value } });
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <label>Off Time (us)</label>
                  <Input
                    type="number"
                    min={0}
                    max={69900000}
                    value={data.NOISES.OFFSTOC}
                    placeholder="Off Time (us)"
                    onChange={(e) => {
                      let value = Number(e.target.value);
                      // Valid range
                      if (value < 0) {
                        value = 0;
                      } else if (value > 69900000) {
                        value = 69900000;
                      }
                      onChange({ ...data, NOISES: { ...data.NOISES, OFFSTOC: value } });
                    }}
                  />
                </div>
              </PopoverContent>
            </Popover>
          </ToggleGroupItem>
        </ToggleGroup>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
};
export default SelectMode;
