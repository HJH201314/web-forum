import type { InputHTMLAttributes } from "vue";

export type ValidationPreset
    = { msg?: string } & (
        { name: 'minLength' | 'maxLength', value: number }
      | { name: 'pattern', value: RegExp }
    );

export type CusInputProps = {
  value?: string;
  modelValue?: string;
  placeholder?: string;
  disabled?: boolean;
  borderIndicator?: boolean; // 边框指示器
  validation?: (value: string) => string; // 验证函数，返回错误信息
  validations?: ValidationPreset[]; // 验证方式集合
  displayValidation?: boolean; // 是否显示验证信息

  inputAttrs?: InputHTMLAttributes;
}