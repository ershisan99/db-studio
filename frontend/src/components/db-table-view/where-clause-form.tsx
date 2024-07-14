import { Button, FormInput, Tooltip } from "@/components/ui";
import { Info, Search } from "lucide-react";
import { useForm } from "react-hook-form";

export interface WhereClauseFormValues {
  whereClause: string;
}

export function WhereClauseForm({
  onSubmit,
}: {
  onSubmit: (values: WhereClauseFormValues) => void;
}) {
  const { control, handleSubmit } = useForm<WhereClauseFormValues>({
    defaultValues: {
      whereClause: "",
    },
  });

  return (
    <form
      className="flex gap-2 "
      onSubmit={handleSubmit(onSubmit)}
      id={"where-clause-form"}
    >
      <FormInput name={"whereClause"} control={control} />
      <Button variant={"outline"} size={"icon"} type={"submit"}>
        <Search className={"size-[1.2rem] shrink-0"} />
      </Button>
      <Tooltip
        content={
          <div>
            Your input will be prefixed with WHERE and appended to the raw SQL
            query.
            <div>You can use AND, OR, NOT, BETWEEN, LIKE, =, etc.</div>
            <div>To remove the WHERE clause, submit an empty input.</div>
          </div>
        }
      >
        <Info className={"size-4 shrink-0 cursor-help"} />
      </Tooltip>
    </form>
  );
}
