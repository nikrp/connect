import * as React from "react"
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

type School = {
    label: string
    value: string
}

type Props = {
    value: string
    onChange: (val: string) => void
    schools: School[]
}
  

export function SchoolComboBox({ value, onChange, schools }: Props) {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState(value || "");

    const filtered = query.length === 0
        ? []
        : schools.filter((s) =>
            s.label.toLowerCase().includes(query.toLowerCase())
        )

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                >
                    {value
                        ? schools.find((school) => school.value === value)?.label
                        : "Select your school"}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-full max-h-96 overflow-y-auto">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search schools..."
                        value={query}
                        onValueChange={setQuery}
                    />
                    <CommandList>
                        {filtered.length === 0 && query.length > 0 ? (
                            <p className="p-2 text-muted-foreground text-sm">No results found.</p>
                        ) : (
                            filtered.slice(0, 50).map((school, index) => (
                                <CommandItem
                                    key={index}
                                    onSelect={() => {
                                        onChange(school.value)
                                        setOpen(false)
                                        setQuery("")
                                }}
                                >
                                    {school.label}
                                </CommandItem>
                            ))
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}