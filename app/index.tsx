import { useRouter } from 'expo-router';
import { motion } from 'framer-motion';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function SplashScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <motion.view
        animate={{ scale: [1, 1.15, 1], rotate: [0, 8, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={styles.logoCircle}
      >
        <Text style={styles.logoIcon}>🛠️</Text>
      </motion.view>

      <motion.text
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.6 }}
        style={styles.title}
      >
        Digital Twin Sensores
      </motion.text>

      <motion.view
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 1.3 }}
        style={{ width: '100%', alignItems: 'center' }}
      >
        <Pressable style={styles.btnPrimary} onPress={() => router.push('/sensors')}>
          <Text style={styles.btnText}>COMEÇAR</Text>
        </Pressable>
        <Pressable style={styles.btnSecondary} onPress={() => router.push('/config')}>
          <Text style={styles.btnText}>CONFIGURAÇÕES</Text>
        </Pressable>
      </motion.view>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  logoCircle: {
    width: 110, height: 110,
    borderRadius: 60, backgroundColor: '#b3000022',
    justifyContent: 'center', alignItems: 'center', marginBottom: 26
  },
  logoIcon: { fontSize: 58, },
  title: { fontSize: 28, fontWeight: 'bold', color: '#b30000', marginBottom: 30, textAlign: 'center' },
  btnPrimary: {
    backgroundColor: '#b30000',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 36,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    minWidth: 180
  },
  btnSecondary: {
    backgroundColor: '#444',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 36,
    alignItems: 'center',
    elevation: 1,
    minWidth: 180
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
    fontSize: 16,
    textAlign: 'center'
  },
});
