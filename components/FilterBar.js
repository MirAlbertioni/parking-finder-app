import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

const FILTERS = [
  { label: 'Alla', value: 'all' },
  { label: 'Gratis', value: 'free' },
  { label: 'Under 25 kr/h', value: 'under25' },
  { label: 'Under 50 kr/h', value: 'under50' },
];

export default function FilterBar({ selected, onSelect }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scrollView}
      contentContainerStyle={styles.container}
    >
      {FILTERS.map((f) => (
        <TouchableOpacity
          key={f.value}
          style={[styles.chip, selected === f.value && styles.chipActive]}
          onPress={() => onSelect(f.value)}
        >
          <Text style={[styles.label, selected === f.value && styles.labelActive]}>
            {f.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 0,
    flexShrink: 0,
  },
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  label: {
    fontSize: 13,
    color: Colors.text,
  },
  labelActive: {
    color: Colors.white,
    fontWeight: '600',
  },
});
