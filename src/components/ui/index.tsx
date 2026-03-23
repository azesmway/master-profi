import { View, Text, Pressable } from 'react-native';

interface EmptyStateProps {
  icon:        string;
  title:       string;
  description: string;
  actionLabel?: string;
  onAction?:   () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center py-16 px-8">
      <Text className="text-5xl mb-4">{icon}</Text>
      <Text className="text-dark dark:text-white text-lg font-semibold mb-2 text-center">{title}</Text>
      <Text className="text-text-muted dark:text-text-secondary text-sm text-center leading-5">{description}</Text>
      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          className="mt-6 bg-primary px-6 py-3 rounded-xl active:opacity-80"
        >
          <Text className="text-dark dark:text-white font-semibold">{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

interface ErrorViewProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorView({ message = 'Что-то пошло не так', onRetry }: ErrorViewProps) {
  return (
    <View className="flex-1 items-center justify-center py-16 px-8">
      <Text className="text-5xl mb-4">⚠️</Text>
      <Text className="text-dark dark:text-white text-lg font-semibold mb-2 text-center">Ошибка</Text>
      <Text className="text-text-muted dark:text-text-secondary text-sm text-center leading-5">{message}</Text>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          className="mt-6 border border-light-border dark:border-dark-border px-6 py-3 rounded-xl active:opacity-80"
        >
          <Text className="text-dark dark:text-white font-medium">Попробовать снова</Text>
        </Pressable>
      )}
    </View>
  );
}

interface SkeletonProps {
  width?:  string;
  height?: number;
  rounded?: string;
}

export function Skeleton({ width = 'w-full', height = 16, rounded = 'rounded-lg' }: SkeletonProps) {
  return (
    <View className={`bg-light-elevated dark:bg-dark-elevated ${width} ${rounded}`} style={{ height }} />
  );
}

export function SpecialistCardSkeleton() {
  return (
    <View className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-4 gap-3">
      <View className="flex-row gap-3">
        <View className="w-14 h-14 rounded-xl bg-light-elevated dark:bg-dark-elevated" />
        <View className="flex-1 gap-2">
          <Skeleton width="w-32" height={14} />
          <Skeleton width="w-20" height={11} />
          <Skeleton width="w-40" height={11} />
        </View>
        <View className="gap-1 items-end">
          <Skeleton width="w-16" height={14} />
          <Skeleton width="w-10" height={11} />
        </View>
      </View>
      <Skeleton width="w-full" height={12} />
      <Skeleton width="w-3/4"  height={12} />
    </View>
  );
}
