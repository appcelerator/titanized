import { device } from '../device';
import { AbstractPresetDialog } from './AbstractPresetDialog';
import { ConfirmDialogOptions, ConfirmResult } from './ConfirmDialog';

export enum PromptInputType {
    Password,
    Text
}

export interface PromptDialogOptions extends ConfirmDialogOptions {
    inputType?: PromptInputType;
    hintText?: string;
}

export interface PromptResult {
    confirm: ConfirmResult;
    value: string;
}

export class PromptDialog extends AbstractPresetDialog<PromptResult> {

    private _androidInput: Titanium.UI.TextField | null = null;

    constructor(options: PromptDialogOptions) {
        super(options);

        this.initializeOkAction(options.okButtonText ? options.okButtonText : 'Ok');
        if (options.neutralButtonText) {
            this.initializeNeutralAction(options.neutralButtonText);
        }
        this.initalizeCancelAction(options.cancelButtonText ? options.cancelButtonText : 'Cancel');

        if (device.runs('android')) {
            this.initializeAndroidPrompt(options);
        } else if (device.runs('ios')) {
            this.initializeIosPrompt(options);
        }
    }

    public show(): Promise<PromptResult> {
        const getValue = (e: any) => {
            if (device.runs('android')) {
                return this._androidInput!.value;
            } else if (device.runs('ios')) {
                return e.text;
            }

            return '';
        };

        return new Promise(resolve => {
            this._okAction!.handler = e => resolve({
                confirm: ConfirmResult.Ok,
                value: getValue(e)
            });
            if (this._neutralAction !== null) {
                this._neutralAction.handler = e => resolve({
                    confirm: ConfirmResult.Neutral,
                    value: getValue(e)
                });
            }
            this._cancelAction!.handler = e => resolve({
                confirm: ConfirmResult.Cancel,
                value: getValue(e)
            });

            this._dialog.show();
        });
    }

    private initializeAndroidPrompt(options: PromptDialogOptions) {
        const inputType = typeof options.inputType !== 'undefined' ? options.inputType : PromptInputType.Text;
        const androidView = Ti.UI.createView();
        this._androidInput = Ti.UI.createTextField({
            left: 20,
            right: 20,
            passwordMask: inputType === PromptInputType.Password,
            hintText: options.hintText
        });
        this._androidInput.hintText = options.hintText!;
        androidView.add(this._androidInput);
        this._dialog.setProperty('androidView', androidView);
    }

    private initializeIosPrompt(options: PromptDialogOptions) {
        const inputType = typeof options.inputType !== 'undefined' ? options.inputType : PromptInputType.Text;
        if (inputType === PromptInputType.Text) {
            this._dialog.setProperty('style', Ti.UI.iOS.AlertDialogStyle.PLAIN_TEXT_INPUT);
        } else {
            this._dialog.setProperty('style', Ti.UI.iOS.AlertDialogStyle.SECURE_TEXT_INPUT);
        }
        this._dialog.setProperty('hintText', options.hintText);
    }
}
