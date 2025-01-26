"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { CheckIcon, XCircle, ChevronDown, XIcon, WandSparkles } from 'lucide-react';

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";


const multiSelectVariants = cva(
  "m-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300",
  {
    variants: {
      variant: {
        default:
          "border-foreground/10 text-foreground bg-card hover:bg-card/80",
        secondary:
          "border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        inverted: "inverted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export const MultiSelect = React.forwardRef(
  (
    {
      options,
      onValueChange,
      variant,
      defaultValue = [],
      placeholder = "Select options",
      animation = 0,
      maxCount = 3,
      modalPopover = false,
      className,
      users,
      ...props
    },
    ref
  ) => {
    const [selectedValues, setSelectedValues] = React.useState(defaultValue);
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
    const [isAnimating, setIsAnimating] = React.useState(false);

    const handleInputKeyDown = (event) => {
      if (event.key === "Enter") {
        setIsPopoverOpen(true);
      } else if (event.key === "Backspace" && !event.currentTarget.value) {
        const newSelectedValues = [...selectedValues];
        newSelectedValues.pop();
        setSelectedValues(newSelectedValues);
        onValueChange(newSelectedValues);
      }
    };

    const toggleOption = (optionValue) => {
      const newSelectedValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((value) => value !== optionValue)
        : [...selectedValues, optionValue];
      setSelectedValues(newSelectedValues);
      onValueChange(newSelectedValues);
    };

    const handleClear = () => {
      setSelectedValues([]);
      onValueChange([]);
    };

    const handleTogglePopover = () => {
      setIsPopoverOpen((prev) => !prev);
    };

    const clearExtraOptions = () => {
      const newSelectedValues = selectedValues.slice(0, maxCount);
      setSelectedValues(newSelectedValues);
      onValueChange(newSelectedValues);
    };

    const animationClass = isAnimating && animation > 0 ? "animate-bounce" : "";

    return (
      <div className="relative">
        <Popover
          open={isPopoverOpen}
          onOpenChange={setIsPopoverOpen}
          modal={modalPopover}
        >
          <PopoverTrigger asChild>
            <div className="w-full">
              <Button
                ref={ref}
                type="button"
                {...props}
                onClick={handleTogglePopover}
                className={cn(
                  "flex w-full p-1 rounded-md border min-h-10 h-auto items-center justify-between bg-inherit hover:bg-inherit [&_svg]:pointer-events-auto",
                  className
                )}
              >
                {selectedValues.length > 0 ? (
                  <div className="flex justify-between items-center w-full">
                    <div className="flex flex-wrap items-center">
                      {selectedValues.slice(0, maxCount).map((value) => {
                        const option = users.find(
                          (o) => o._id.toString() === value.toString()
                        );
                        return (
                          <Badge
                            key={value}
                            className={cn(
                              animationClass,
                              multiSelectVariants({ variant })
                            )}
                            style={
                              animation > 0
                                ? { animationDuration: `${animation}s` }
                                : undefined
                            }
                          >
                            {option?.username}
                            <XCircle
                              className="ml-2 h-4 w-4 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleOption(value);
                              }}
                            />
                          </Badge>
                        );
                      })}
                      {selectedValues.length > maxCount && (
                        <Badge
                          className={cn(
                            "bg-transparent text-foreground border-foreground/10 hover:bg-transparent",
                            animationClass,
                            multiSelectVariants({ variant })
                          )}
                          style={
                            animation > 0
                              ? { animationDuration: `${animation}s` }
                              : undefined
                          }
                        >
                          {`+ ${selectedValues.length - maxCount} more`}
                          <XCircle
                            className="ml-2 h-4 w-4 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              clearExtraOptions();
                            }}
                          />
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <XIcon
                        className="h-4 mx-2 cursor-pointer text-muted-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClear();
                        }}
                      />
                      <Separator
                        orientation="vertical"
                        className="flex min-h-6 h-full"
                      />
                      <ChevronDown className="h-4 mx-2 cursor-pointer text-muted-foreground" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full mx-auto">
                    <span className="text-sm text-muted-foreground mx-3">
                      {placeholder}
                    </span>
                    <ChevronDown className="h-4 cursor-pointer text-muted-foreground mx-2" />
                  </div>
                )}
              </Button>
            </div>
          </PopoverTrigger>
          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] p-0"
            align="start"
            onEscapeKeyDown={() => setIsPopoverOpen(false)}
          >
            <Command>
              <CommandInput
                placeholder="Search..."
                onKeyDown={handleInputKeyDown}
              />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  {options.map((option, i) => {
                    return (
                      <CommandItem
                        key={i}
                        onSelect={() => toggleOption(option._id)}
                        className="cursor-pointer"
                      >
                        <span>
                          {i + 1}. {option.username}
                        </span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup>
                  <div className="flex items-center justify-between">
                    {selectedValues.length > 0 && (
                      <>
                        <CommandItem
                          onSelect={handleClear}
                          className="flex-1 justify-center cursor-pointer"
                        >
                          Clear
                        </CommandItem>
                        <Separator
                          orientation="vertical"
                          className="flex min-h-6 h-full"
                        />
                      </>
                    )}
                    <CommandItem
                      onSelect={() => setIsPopoverOpen(false)}
                      className="flex-1 justify-center cursor-pointer"
                    >
                      Close
                    </CommandItem>
                  </div>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {animation > 0 && selectedValues.length > 0 && (
          <WandSparkles
            className={cn(
              "absolute -right-6 top-1/2 -translate-y-1/2 cursor-pointer text-foreground bg-background w-4 h-4",
              isAnimating ? "" : "text-muted-foreground"
            )}
            onClick={() => setIsAnimating(!isAnimating)}
          />
        )}
      </div>
    );
  }
);

MultiSelect.displayName = "MultiSelect";

// export  default MultiSelectProps ;

