import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui";
import { useSettingsStore } from "@/state";
import { Settings, Trash } from "lucide-react";
import type { FormEventHandler } from "react";

export function SettingsDialog() {
  const addPaginationOption = useSettingsStore.use.addPaginationOption();
  const removePaginationOption = useSettingsStore.use.removePaginationOption();
  const paginationOptions = useSettingsStore.use.paginationOptions();

  const formatDates = useSettingsStore.use.formatDates();
  const setFormatDates = useSettingsStore.use.setFormatDates();

  const showImagesPreview = useSettingsStore.use.showImagesPreview();
  const setShowImagesPreview = useSettingsStore.use.setShowImagesPreview();

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const stringValue = formData.get("option");
    if (!stringValue || typeof stringValue !== "string") {
      return;
    }

    const value = Number.parseInt(stringValue, 10);
    if (Number.isNaN(value)) {
      return;
    }

    addPaginationOption(value);
    e.currentTarget.reset();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size={"icon"}>
          <Settings className={"size-[1.2rem]"} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1025px]">
        <DialogHeader>
          <DialogTitle>Global Settings</DialogTitle>
          <DialogDescription>
            Update global settings for the app. Changes will be applied
            immediately and persisted to local storage.
          </DialogDescription>
        </DialogHeader>
        <div className={"space-y-6"}>
          <div>
            <h2>Pagination options</h2>
            <p>Add or remove options for the amount of rows per page</p>
            <Table className={"w-auto"}>
              <TableBody>
                {paginationOptions.map((option) => (
                  <TableRow key={option} className={"border-none"}>
                    <TableCell className={"px-2 py-1 text-end"}>
                      {option}
                    </TableCell>
                    <TableCell className={"px-2 py-1"}>
                      <Button
                        variant={"ghost"}
                        size={"iconSm"}
                        onClick={() => removePaginationOption(option)}
                        title={"Delete option"}
                      >
                        <Trash className={"size-4"} />
                        <span className={"sr-only"}>Delete option</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <form className={"mt-4 flex gap-4"} onSubmit={handleSubmit}>
              <Input name={"option"} type={"number"} className={"max-w-28"} />
              <Button>Add</Button>
            </form>
          </div>
          <div>
            <h2>Automatically format dates</h2>
            <p>
              When turned on, will show timestamp cells in tables in a human
              readable format
            </p>
            <Switch
              checked={formatDates}
              onCheckedChange={setFormatDates}
              className={"mt-4"}
            />
          </div>
          <div>
            <h2>Show previews for images</h2>
            <p>
              When turned on, will automatically detect image URL's in tables
              and add a preview alongside.
            </p>
            <p>
              Might significantly increase load on you CDN, use with caution.
            </p>
            <Switch
              checked={showImagesPreview}
              onCheckedChange={setShowImagesPreview}
              className={"mt-4"}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
