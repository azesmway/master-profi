import 'react-native';

declare module 'react-native' {
  export interface TextInputStyles {
    /**
     * Стиль обводки. Расширение типа для поддержки значения 'none'.
     */
    outlineStyle?: 'solid' | 'dotted' | 'dashed' | 'none' | undefined;
  }

  export interface TextStyle {
    /**
     * Стиль обводки. Расширение типа для поддержки значения 'none'.
     */
    outlineStyle?: 'solid' | 'dotted' | 'dashed' | 'none' | undefined;
  }
}
