import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform, Linking } from 'react-native';
import { Colors } from '../constants/colors';
import { estimateZone, ZONE_TARIFFS, getCurrentRate } from '../services/pricingService';

const PARKING_TYPES = {
  surface: 'Markparkering',
  'multi-storey': 'Parkeringshus',
  underground: 'Underjordisk parkering',
  'street side': 'Gatuparkering',
  rooftop: 'Takparkering',
  lane: 'Vägkantsparkering',
};

function navigateTo(lat, lng, name) {
  const label = encodeURIComponent(name);
  const url = Platform.select({
    ios: `maps:0,0?q=${label}@${lat},${lng}`,
    android: `geo:0,0?q=${lat},${lng}(${label})`,
  });
  Linking.canOpenURL(url).then((supported) => {
    Linking.openURL(
      supported ? url : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    );
  });
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function PricingSection({ parking }) {
  if (parking.isFree) return null;

  const zone = estimateZone(parking.lat, parking.lng);
  const tariff = ZONE_TARIFFS[zone];
  const currentRate = getCurrentRate(zone);
  const currentLabel = currentRate === 0 ? 'Gratis just nu' : `${currentRate} kr/h just nu`;

  return (
    <View style={styles.pricingSection}>
      <View style={styles.pricingHeader}>
        <Text style={styles.pricingTitle}>Taxa</Text>
        <Text style={styles.pricingZone}>{tariff.zoneName}</Text>
      </View>

      <View style={[styles.currentRate, currentRate === 0 ? styles.currentRateFree : styles.currentRatePaid]}>
        <Text style={styles.currentRateText}>{currentLabel}</Text>
      </View>

      <View style={styles.schedule}>
        {tariff.periods.map((p, i) => (
          <View key={i} style={styles.scheduleRow}>
            <Text style={styles.scheduleLabel}>{p.label}</Text>
            <Text style={[styles.schedulePrice, p.price === 0 && styles.schedulePriceFree]}>
              {p.price === 0 ? 'Gratis' : `${p.price} kr/h`}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.disclaimer}>
        * Uppskattad taxa baserad på Stockholms zonsystem. Kontrollera skyltning på plats.
      </Text>
    </View>
  );
}

export default function ParkingDetail({ parking, onClose }) {
  if (!parking) return null;

  const typeLabel = PARKING_TYPES[parking.description] ?? parking.description ?? null;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={2}>{parking.name}</Text>
          <View style={[styles.badge, parking.isFree ? styles.badgeFree : styles.badgePaid]}>
            <Text style={styles.badgeText}>
              {parking.isFree ? 'Gratis' : parking.pricePerHour != null ? `${parking.pricePerHour} kr/h` : 'Betald'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Row label="Adress" value={parking.address || null} />
        <Row label="Maxtid" value={parking.maxHours ? `${parking.maxHours} timmar` : null} />
        <Row label="Typ" value={typeLabel} />

        <PricingSection parking={parking} />

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateTo(parking.lat, parking.lng, parking.name)}
        >
          <Text style={styles.navButtonText}>Navigera hit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Stäng</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    alignSelf: 'flex-start',
  },
  badgeFree: { backgroundColor: Colors.free },
  badgePaid: { backgroundColor: Colors.paid },
  badgeText: { color: Colors.white, fontSize: 13, fontWeight: '600' },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  rowLabel: { fontSize: 14, color: Colors.subtext },
  rowValue: { fontSize: 14, fontWeight: '600', color: Colors.text, flex: 1, textAlign: 'right' },

  // Pricing
  pricingSection: {
    marginTop: 14,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 14,
  },
  pricingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pricingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  pricingZone: {
    fontSize: 12,
    color: Colors.subtext,
  },
  currentRate: {
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  currentRatePaid: { backgroundColor: Colors.primary },
  currentRateFree: { backgroundColor: Colors.free },
  currentRateText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  schedule: {
    gap: 6,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scheduleLabel: {
    fontSize: 13,
    color: Colors.subtext,
    flex: 1,
  },
  schedulePrice: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  schedulePriceFree: {
    color: Colors.free,
  },
  disclaimer: {
    fontSize: 11,
    color: Colors.subtext,
    marginTop: 10,
    fontStyle: 'italic',
  },

  navButton: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  navButtonText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
  closeButton: { marginTop: 10, paddingVertical: 12, alignItems: 'center' },
  closeButtonText: { fontSize: 14, color: Colors.subtext },
});
