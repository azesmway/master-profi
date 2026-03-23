import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { makeStyles } from '@/utils/makeStyles';
import { chatService } from '@/services/chatService';
import { useAuthStore } from '@/store/authStore';
import { QUERY_KEYS } from '@/constants';
import type { ChatRoom } from '@/types';

const ESCROW_BADGE: Record<string, { label: string; color: string } | undefined> = {
  held:     { label: '🔒 Эскроу', color: '#8B5CF6' },
  pending:  { label: '⏳ Ожидает', color: '#F59E0B' },
  released: { label: '✅ Завершён', color: '#22C55E' },
  disputed: { label: '⚠️ Спор',    color: '#EF4444' },
};

function timeLabel(iso: string) {
  const d    = new Date(iso);
  const now  = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return d.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
  if (diff === 1) return 'Вчера';
  return d.toLocaleDateString('ru', { day: 'numeric', month: 'short' });
}

function ChatRow({ room, myId, onPress, colors }: {
  room:    ChatRoom;
  myId:    string;
  onPress: () => void;
  colors:  any;
}) {
  const other    = (room.participants ?? []).find((p: any) => p.id !== myId);
  const name     = other?.name ?? 'Собеседник';
  const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  const last     = room.lastMessage;
  const badge    = room.escrowStatus ? ESCROW_BADGE[room.escrowStatus] : undefined;

  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingHorizontal: 20, paddingVertical: 14,
      }}
    >
      <View style={{ position: 'relative' }}>
        <View style={{
          width: 48, height: 48, borderRadius: 24,
          backgroundColor: '#FF6B3520',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ color: '#FF6B35', fontWeight: '700', fontSize: 14 }}>
            {initials}
          </Text>
        </View>
        {(room.unreadCount ?? 0) > 0 && (
          <View style={{
            position: 'absolute', top: -2, right: -2,
            width: 20, height: 20, borderRadius: 10,
            backgroundColor: '#FF6B35',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
              {room.unreadCount}
            </Text>
          </View>
        )}
      </View>

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 15 }}>{name}</Text>
            {badge && (
              <View style={{ backgroundColor: badge.color + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                <Text style={{ color: badge.color, fontSize: 11, fontWeight: '600' }}>{badge.label}</Text>
              </View>
            )}
          </View>
          {last && (
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>
              {timeLabel(last.createdAt)}
            </Text>
          )}
        </View>
        {last && (
          <Text
            style={{ fontSize: 14, color: (room.unreadCount ?? 0) > 0 ? colors.text : colors.textSecondary }}
            numberOfLines={1}
          >
            {last.senderId === myId ? 'Вы: ' : ''}{last.content}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

export default function ChatsListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const s      = makeStyles(colors);
  const myId   = useAuthStore((s) => s.user?.id) ?? '';

  const { data, isLoading, refetch } = useQuery({
    queryKey:  [QUERY_KEYS.CHAT_ROOMS],
    queryFn:   () => chatService.getRooms().then((r) => r.data.data),
    staleTime: 1000 * 30,
  });

  const rooms        = data ?? [];
  const totalUnread  = rooms.reduce((sum: number, r: any) => sum + (r.unreadCount ?? 0), 0);

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={[s.textTitle, { fontSize: 24 }]}>Чаты</Text>
          {totalUnread > 0 && (
            <Text style={{ color: '#FF6B35', fontSize: 12, marginTop: 2 }}>
              {totalUnread} непрочитанных
            </Text>
          )}
        </View>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item: any) => item.id}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={false}
          ItemSeparatorComponent={() => (
            <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 80 }} />
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 64, paddingHorizontal: 32 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>💬</Text>
              <Text style={[s.textTitle, { marginBottom: 8 }]}>Нет чатов</Text>
              <Text style={[s.textSecondary, { textAlign: 'center' }]}>
                Чаты появятся когда вы примете отклик специалиста
              </Text>
            </View>
          }
          renderItem={({ item, index }: any) => (
            <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
              <ChatRow
                room={item}
                myId={myId}
                colors={colors}
                onPress={() => router.push(`/chat/${item.id}`)}
              />
            </Animated.View>
          )}
        />
      )}
    </View>
  );
}
