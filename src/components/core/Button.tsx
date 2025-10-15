import React from "react";
import { TouchableOpacity, Text, View, ActivityIndicator } from "react-native";
import LinearGradient from 'react-native-linear-gradient';

interface ButtonProps {
  title?: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "danger" | "ghost" | "white";
  onPress?: () => void;
  children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  title,
  className = "",
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
  children,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          gradient: ["#e6c619", "#e6c619"],
          textColor: "text-white",
        };
      case "secondary":
        return {
          gradient: ["#4B5563", "#374151"],
          textColor: "text-white",
        };

      case "danger":
        return {
          gradient: ["#EF4444", "#DC2626"],
          textColor: "text-white",
        };

      case "ghost":
        return {
          gradient: ["transparent", "transparent"],
          textColor: "text-gray-200",
        };

      case "white":
        return {
          gradient: ["#FFFFFF", "#FFFFFF"],
          textColor: "text-gray-900",
        };

      default:
        return {
          gradient: ["#058669", "#047857"] as [string, string],
          textColor: "text-white",
        };
    }
  };

  const { gradient, textColor } = getVariantStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`overflow-hidden   ${disabled ? "opacity-50" : ""} ${className}`}
      style={{
        elevation: 3,
      }}
    >
      <LinearGradient
        colors={
          (disabled ? ["#9CA3AF", "#6B7280"] : gradient) as [string, string]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-4 py3.5"
      >
        <View className="flex-row items-center justify-center py-4">
          {loading && (
            <ActivityIndicator size="small" color="#ffffff" className="mr-2" />
          )}
          {children ? (
            children
          ) : (
            <Text className={`text-center font-semibold ${textColor}`}>
              {title}
            </Text>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default Button;
