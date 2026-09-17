import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

import { Spacing } from '@/constants/theme';
import { UserPreferencesInput } from '@/types/user';


type UserPreferencesModalProps = {
  /** Show the modal. There is no dismiss/cancel — this is required onboarding. */
  visible: boolean;
  /** Called with a validated payload when the user submits. */
  onSubmit: (values: UserPreferencesInput) => void;
  /** Disables the submit button and shows a saving state while the BE call is in flight. */
  isSubmitting?: boolean;
  /** Server/mutation error to surface above the submit button. */
  errorMessage?: string | null;
};

const MIN_SLEEP_HOURS = 1;
const MAX_SLEEP_HOURS = 14;
const DEFAULT_SLEEP_HOURS = 8;

export function UserPreferencesModal({
  visible,
  onSubmit,
  isSubmitting = false,
  errorMessage = null,
}: UserPreferencesModalProps) {
  const [name, setName] = useState('');
  const [dob, setDob] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [nocturne, setNocturne] = useState(false);
  const [idealHoursOfSleep, setIdealHoursOfSleep] = useState(DEFAULT_SLEEP_HOURS);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    // Android's picker is a dialog that closes itself; iOS's is an inline
    // spinner, so we only auto-hide on Android.
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDob(selectedDate);
    }
  };

  const adjustSleepHours = (delta: number) => {
    setIdealHoursOfSleep((prev) =>
      Math.min(MAX_SLEEP_HOURS, Math.max(MIN_SLEEP_HOURS, prev + delta))
    );
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      setValidationError('Please enter your name.');
      return;
    }

    setValidationError(null);
    onSubmit({
      name: name.trim(),
      dob,
      nocturne,
      idealHoursOfSleep,
    });
  };

  const formattedDob = dob
    ? dob.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Select your date of birth';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={() => {
        // Onboarding is required, so the Android hardware back button is a no-op.
      }}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoiding}
        >
          <View style={styles.card}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.title}>Welcome! Let's set you up</Text>
              <Text style={styles.subtitle}>
                A few quick details so we can personalize your experience.
              </Text>

              <View style={styles.field}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Jane Doe"
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Date of birth</Text>
                <Pressable style={styles.input} onPress={() => setShowDatePicker(true)}>
                  <Text style={dob ? styles.inputText : styles.placeholderText}>
                    {formattedDob}
                  </Text>
                </Pressable>
                {showDatePicker && (
                  <DateTimePicker
                    value={dob ?? new Date(2000, 0, 1)}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    maximumDate={new Date()}
                    onChange={handleDateChange}
                  />
                )}
              </View>

              <View style={[styles.field, styles.rowField]}>
                <View style={styles.rowFieldText}>
                  <Text style={styles.label}>Night owl?</Text>
                  <Text style={styles.helperText}>
                    We'll tailor reminders around a later bedtime.
                  </Text>
                </View>
                <Switch value={nocturne} onValueChange={setNocturne} />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Ideal hours of sleep</Text>
                <View style={styles.stepper}>
                  <Pressable
                    style={styles.stepperButton}
                    onPress={() => adjustSleepHours(-1)}
                    disabled={idealHoursOfSleep <= MIN_SLEEP_HOURS}
                  >
                    <Text style={styles.stepperButtonText}>−</Text>
                  </Pressable>
                  <Text style={styles.stepperValue}>{idealHoursOfSleep}h</Text>
                  <Pressable
                    style={styles.stepperButton}
                    onPress={() => adjustSleepHours(1)}
                    disabled={idealHoursOfSleep >= MAX_SLEEP_HOURS}
                  >
                    <Text style={styles.stepperButtonText}>+</Text>
                  </Pressable>
                </View>
              </View>

              {(validationError || errorMessage) && (
                <Text style={styles.errorText}>{validationError ?? errorMessage}</Text>
              )}

              <Pressable
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? 'Saving…' : 'Get started'}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  keyboardAvoiding: {
    width: '100%',
  },
  card: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  scrollContent: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: Spacing.two,
  },
  field: {
    marginBottom: Spacing.two,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.one,
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  inputText: {
    fontSize: 16,
    color: '#111827',
  },
  placeholderText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  rowField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowFieldText: {
    flex: 1,
    marginRight: Spacing.two,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  stepperButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  stepperValue: {
    fontSize: 18,
    fontWeight: '600',
    minWidth: 48,
    textAlign: 'center',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    marginBottom: Spacing.two,
  },
  submitButton: {
    backgroundColor: '#111827',
    borderRadius: 14,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});