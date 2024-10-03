import {
  TextProps as RNTextProps,
  StyleSheet,
  Text as RNText
} from "react-native";

interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6';
  text?: string;
  }
  
export const Text: React.FC<TextProps> = ({
    children,
    variant = 'p1',
    text,
    style,
    ...rest
}) => {
const styles = textStyles();

return (
    <RNText style={[styles[variant], style]} {...rest}>
    {children || text}
    </RNText>
  );
};

const textStyles = () => StyleSheet.create({
  h1: { fontSize: 20, color: "#ffffff", fontWeight: 'bold' },
  h2: { fontSize: 18, color: "#ffffff", fontWeight: 'bold' },
  h3: { fontSize: 16, color: "#ffffff", fontWeight: '700' },
  h4: { fontSize: 15, color: "#ffffff", fontWeight: '700' },
  h5: { fontSize: 14, color: "#ffffff", fontWeight: '600' },
  h6: { fontSize: 13, color: "#ffffff", fontWeight: '600' },
  p1: { fontSize: 15, color: "#f2f2f2", fontWeight: '500' },
  p2: { fontSize: 14, color: "#f2f2f2", fontWeight: '500' },
  p3: { fontSize: 13, color: "#f2f2f2", fontWeight: '300' },
  p4: { fontSize: 12, color: "#f2f2f2", fontWeight: '300' },
  p5: { fontSize: 11, color: "#cccccc", fontWeight: "200" },
  p6: { fontSize: 10, color: "#cccccc", fontWeight: '200' },
});
