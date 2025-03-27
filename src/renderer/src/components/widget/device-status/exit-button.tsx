import { Button } from "@renderer/components/ui/button";

const ExitButton = () => {
  return (
    <Button variant="destructive" className="mt-auto w-full" onClick={window.context.app.exit}>
      Exit
    </Button>
  );
};
export default ExitButton;
