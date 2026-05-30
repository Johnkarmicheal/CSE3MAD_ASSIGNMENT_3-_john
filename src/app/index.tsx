import { useTheme } from "@/theme";

import { Accelerometer } from "expo-sensors";
import { useTheme as useRETheme } from "re-native-ui";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

interface NumericStepperProps {
  value: number;
  onChange: (value: number) => void;
  disabled: boolean;
  colors: any;
  styles: any;
}

const NumericStepper: React.FC<NumericStepperProps> = ({
  value,
  onChange,
  disabled,
  colors,
  styles,
}) => {
  const increment = () => onChange(Math.min(600, value + 5));
  const decrement = () => onChange(Math.max(5, value - 5));

  return (
    <View style={styles.stepperContainer}>
      <TouchableOpacity
        style={[
          styles.stepperButton,
          { backgroundColor: colors.surface },
          disabled && { opacity: 0.5 },
        ]}
        onPress={decrement}
        disabled={disabled}
      >
        <Text style={{ color: colors.text }}>-</Text>
      </TouchableOpacity>

      <Text
        style={[
          styles.large_font,
          { color: colors.text, marginHorizontal: 20 },
        ]}
      >
        {value}s
      </Text>

      <TouchableOpacity
        style={[
          styles.stepperButton,
          { backgroundColor: colors.surface },
          disabled && { opacity: 0.3 },
        ]}
        onPress={increment}
        disabled={disabled}
      >
        <Text style={{ color: colors.text, fontWeight: "bold" }}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

interface DataPoint {
  timestamp: number;
  magnitude: number;
}

export default function Assignment3() {
  const [targetSeconds, setTargetSeconds] = useState(10);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const { colors, setScheme, isDark } = useTheme();

  const changeTheme = () => {
    isDark ? setScheme("light") : setScheme("dark");
  };

  const theme = useRETheme();
  theme.colors.background = colors.background;
  theme.colors.primary = colors.primary;
  theme.colors.text = colors.text;
  theme.colors.border = colors.border;

  // Call hook for sensor <----------------------------------------------
  const dataPointsRef = useRef<DataPoint[]>([]);
  const [chartPoints, setChartPoints] = useState<DataPoint[]>([]); // Only for UI rendering

  const [acc, setAccData] = useState({ x: 0, y: 0, z: 0 });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isActiveRef = useRef(false);

  const accLiveRef = useRef({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    Accelerometer.setUpdateInterval(100);
    const subscription = Accelerometer.addListener((accelerometerData) => {
      setAccData(accelerometerData);
      accLiveRef.current = accelerometerData;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    isActiveRef.current = isActive; // Keep the ref in sync with the state
  }, [isActive]);

  useEffect(() => {
    if (isActive) {
      dataPointsRef.current = []; // Clear ref
      setChartPoints([]); // Clear UI
      setSeconds(0);

      timerRef.current = setInterval(() => {
        if (!isActiveRef.current) {
          clearInterval(timerRef.current!);
          return;
        }

        setSeconds((prev) => {
          const nextSecond = prev + 1;

          const currentAcc = accLiveRef.current;
          const magnitude = parseFloat(
            (
              Math.sqrt(
                currentAcc.x ** 2 + currentAcc.y ** 2 + currentAcc.z ** 2,
              ) * 9806.65
            ).toFixed(2),
          );

          if (isFinite(magnitude)) {
            const newPoint = { timestamp: Date.now(), magnitude };
            dataPointsRef.current = [...dataPointsRef.current, newPoint];
            setChartPoints([...dataPointsRef.current]); // Update chart
          }
          if (nextSecond >= targetSeconds) {
            clearInterval(timerRef.current!);
            setIsActive(false);

            return nextSecond;
          }
          return nextSecond;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const cancelRecording = () => {
    setIsActive(false);
    setSeconds(0);
    setChartPoints([]);
  };

  const startRecording = () => {
    setIsActive(true);
  };

  const chartData = {
    labels:
      chartPoints.length > 0 ? chartPoints.map((_, i) => `${i + 1}`) : ["0"],
    datasets: [
      {
        data:
          chartPoints.length > 0 ? chartPoints.map((p) => p.magnitude) : [0],
      },
    ],
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 60 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ width: "100%" }}>
        <TouchableOpacity
          onPress={changeTheme}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ alignSelf: "flex-end" }}
        >
          <MaterialIcons
            name={isDark ? "wb-sunny" : "nights-stay"}
            size={28}
            color={isDark ? "#FFD700" : "#000"}
          />
        </TouchableOpacity>
      </View>

      <NumericStepper
        value={targetSeconds}
        onChange={setTargetSeconds}
        disabled={isActive}
        colors={colors}
        styles={styles}
      />
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <Text style={[styles.timerText, { color: colors.text }]}>
          Recording: {seconds}s
        </Text>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: isActive ? "#ff0000" : "#4cd964" },
            isActive && { opacity: 0.6 },
          ]}
          onPress={startRecording}
          disabled={isActive}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>
            {isActive ? "Stop Recording" : "Start Recording"}
          </Text>
        </TouchableOpacity>
        {isActive && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#ff9500" }]}
            onPress={cancelRecording}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        )}
        {acc ? (
          <View
            style={[
              styles.dataContainer,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.header, { color: colors.text }]}>
              Accelerometer Live Metrics
            </Text>

            <Text style={{ color: colors.text }}>
              X: {(acc.x * 9806.65).toFixed(0)} mm/s²
            </Text>
            <Text style={{ color: colors.text }}>
              Y: {(acc.y * 9806.65).toFixed(0)} mm/s²
            </Text>
            <Text style={{ color: colors.text }}>
              Z: {(acc.z * 9806.65).toFixed(0)} mm/s²
            </Text>
          </View>
        ) : null}

        <Text style={[styles.graphHeader, { color: colors.text }]}>
          Total Magnitude (g) over Time
        </Text>
        {chartPoints.length > 0 && (
          <LineChart
            data={chartData}
            width={Dimensions.get("window").width - 32}
            height={220}
            chartConfig={{
              backgroundColor: colors.background,
              backgroundGradientFrom: colors.background,
              backgroundGradientTo: colors.surface || colors.background,
              color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
              labelColor: (opacity = 1) => colors.text,
            }}
            style={styles.chart}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
  },

  headerTitle: { fontSize: 22, fontWeight: "bold", flex: 1, marginRight: 10 },

  timerText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  dataContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  header: {
    fontWeight: "bold",
    fontSize: 16,
  },
  graphHeader: {
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 20,
  },
  box: {
    width: 100,
    height: 100,
    backgroundColor: "black",
    margin: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  screen: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
  },

  box2: {
    justifyContent: "center",
    alignItems: "stretch",
    borderWidth: 2,
    borderRadius: 5,
    padding: 5,

    minWidth: 400,
  },
  heading: {
    padding: 20,
    fontSize: 20,
    fontWeight: "bold",
  },
  info: {
    gap: 40,
  },
  row: {
    flexDirection: "row",
    gap: 20,
    justifyContent: "space-between",
  },
  input: {
    flex: 1,
    marginBottom: 0,
  },
  large_font: {
    fontSize: 20,
  },
  bold_text: {
    fontWeight: "bold",
    fontSize: 20,
  },
  members: {
    gap: 5,
  },
  members_text: {
    textAlign: "right",
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  stepperButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
});
