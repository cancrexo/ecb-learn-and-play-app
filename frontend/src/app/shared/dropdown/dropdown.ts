import {
    Component,
    ElementRef,
    HostListener,
    Input,
    forwardRef,
    signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface DropdownOption<T = number | string> {
    value: T;
    label: string;
}

@Component({
    selector: 'app-dropdown',
    standalone: true,
    templateUrl: './dropdown.html',
    styleUrl: './dropdown.scss',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DropdownComponent),
            multi: true,
        },
    ],
})
export class DropdownComponent implements ControlValueAccessor {
    @Input({ required: true }) options: DropdownOption[] = [];
    @Input() placeholder = 'Select an option';

    readonly isOpen = signal(false);
    readonly value = signal<number | string | null>(null);
    readonly disabled = signal(false);

    private onChange: (value: number | string | null) => void = () => {};
    private onTouched: () => void = () => {};

    constructor(private elementRef: ElementRef<HTMLElement>) {}

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        if (!this.elementRef.nativeElement.contains(event.target as Node)) {
            this.isOpen.set(false);
        }
    }

    @HostListener('document:keydown.escape')
    onEscape() {
        this.isOpen.set(false);
    }

    selectedLabel(): string | null {
        const current = this.value();
        if (current === null || current === '') {
            return null;
        }

        return this.options.find((option) => option.value === current)?.label ?? null;
    }

    toggle(event: Event) {
        event.stopPropagation();

        if (this.disabled()) {
            return;
        }

        this.isOpen.update((open) => !open);
    }

    select(option: DropdownOption, event: Event) {
        event.stopPropagation();
        this.value.set(option.value);
        this.onChange(option.value);
        this.onTouched();
        this.isOpen.set(false);
    }

    writeValue(value: number | string | null): void {
        this.value.set(value === '' || value === null || value === undefined ? null : value);
    }

    registerOnChange(fn: (value: number | string | null) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled.set(isDisabled);
    }
}
