import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  ScrollView,
} from 'react-native';

import { useColorScheme } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import {
  Event,
  useAttachEventToNight,
  useCreateEvent,
  useCustomerEvents,
  useNightEvents,
} from '@/hooks/use-events';

const palette = {
  light: {
    border: 'rgba(0,0,0,0.15)',
    inputBackground: '#F2F2F2',
    text: '#1A1A1A',
    placeholder: '#8A8A8A',
    tint: '#6C5CE7',
  },
  dark: {
    border: 'rgba(255,255,255,0.2)',
    inputBackground: '#2A2A2E',
    text: '#F2F2F2',
    placeholder: '#9A9A9A',
    tint: '#8A7CFF',
  },
};

function usePalette() {
  const scheme = useColorScheme();
  return palette[scheme === 'dark' ? 'dark' : 'light'];
}

export function NightEvents({ nightId }: { nightId: number }) {
  const [modalVisible, setModalVisible] = useState(false);

  const {
    data: nightEvents,
    isLoading: nightEventsLoading,
    isError: nightEventsError,
  } = useNightEvents(nightId);

  const nightEventsList = Array.isArray(nightEvents) ? nightEvents : [];
  const [expandedEvents, setExpandedEvents] = useState<Set<number>>(new Set());

  const toggleEvent = (eventId: number) => {
    setExpandedEvents((prev) => {
      const next = new Set(prev);

      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }

      return next;
    });
  };


  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.header}>
        <ThemedText type="subtitle">Events</ThemedText>
        <Pressable style={styles.addButton} onPress={() => setModalVisible(true)}>
          <ThemedText style={styles.addButtonText}>+ Add Event</ThemedText>
        </Pressable>
      </View>

      {nightEventsLoading && <ThemedText type="default">Loading events…</ThemedText>}

      {nightEventsError && (
        <ThemedText type="default" style={styles.errorText}>
          Couldn't load events for this night.
        </ThemedText>
      )}

      {!nightEventsLoading && !nightEventsError && nightEventsList.length === 0 && (
        <ThemedText type="default" style={styles.placeholder}>
          No events logged for this night.
        </ThemedText>
      )}

      {!!nightEventsList.length && (
      <View style={styles.eventList}>
        {nightEventsList.map((event) => {
          const expanded = expandedEvents.has(event.id);

          return (
            <Pressable
              key={event.id}
              style={styles.eventRow}
              onPress={() => toggleEvent(event.id)}
            >
              <View style={styles.bullet} />

              <View style={styles.eventTextWrap}>
                <View style={styles.eventHeader}>
                  <ThemedText style={styles.eventName}>
                    {event.name}
                  </ThemedText>

                  <ThemedText style={styles.expandIcon}>
                    {expanded ? '−' : '+'}
                  </ThemedText>
                </View>

                {expanded && event.description && (
                  <ThemedText
                    type="default"
                    style={styles.eventDescription}
                  >
                    {event.description}
                  </ThemedText>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    )}

      <AddEventModal
        nightId={nightId}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        alreadyAttachedIds={nightEventsList.map((e) => e.id)}
      />
    </ThemedView>
  );
}

type ItemStatus = 'idle' | 'pending' | 'success' | 'error';

function AddEventModal({
  nightId,
  visible,
  onClose,
  alreadyAttachedIds,
}: {
  nightId: number;
  visible: boolean;
  onClose: () => void;
  alreadyAttachedIds: number[];
}) {
  const [newEventName, setNewEventName] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [itemStatus, setItemStatus] = useState<Record<number, ItemStatus>>({});

  const { data: allEvents, isLoading } = useCustomerEvents();
  const attachEvent = useAttachEventToNight(nightId);
  const createEvent = useCreateEvent();

  const colors = usePalette();

  // Theme-aware colors — adjust keys to match your Colors constant
  const borderColor = colors.border;
  const inputBackground = colors.inputBackground;
  const textColor = colors.text;
  const placeholderColor = colors.placeholder;
  const tint = colors.tint;
  
  const selectableEvents = useMemo(
    () => (allEvents ?? []).filter((e) => !alreadyAttachedIds.includes(e.id)),
    [allEvents, alreadyAttachedIds],
  );

  const handleSelectExisting = (event: Event) => {
    if (itemStatus[event.id] === 'pending' || itemStatus[event.id] === 'success') return;

    setItemStatus((prev) => ({ ...prev, [event.id]: 'pending' }));

    attachEvent.mutate(event.id, {
      onSuccess: () => {
        setItemStatus((prev) => ({ ...prev, [event.id]: 'success' }));
      },
      onError: () => {
        setItemStatus((prev) => ({ ...prev, [event.id]: 'error' }));
      },
    });
  };

  const handleCreateAndAttach = async () => {
    if (!newEventName.trim()) return;

    try {
      const created = await createEvent.mutateAsync({
        custom: true,
        name: newEventName.trim(),
        description: newEventDescription.trim() || null,
      });

      await attachEvent.mutateAsync(created.id);
      setNewEventName('');
      setNewEventDescription('');
    } catch {
      // surfaced via createEvent.isError / attachEvent.isError below
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <ThemedView type="backgroundElement" style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <ThemedText type="subtitle">Add Event</ThemedText>
            <Pressable onPress={onClose}>
              <ThemedText>Close</ThemedText>
            </Pressable>
          </View>

          {isLoading && <ThemedText type="default">Loading…</ThemedText>}

          <FlatList
            data={selectableEvents}
            keyExtractor={(item) => String(item.id)}
            style={styles.list}
            ListEmptyComponent={
              !isLoading ? (
                <ThemedText type="default" style={styles.placeholder}>
                  No existing events to add.
                </ThemedText>
              ) : null
            }
            renderItem={({ item }) => {
              const status = itemStatus[item.id] ?? 'idle';
              return (
                <Pressable
                  style={[styles.listItem, { borderBottomColor: borderColor }]}
                  onPress={() => handleSelectExisting(item)}
                  disabled={status === 'pending' || status === 'success'}
                >
                  <View style={styles.listItemTextWrap}>
                    <ThemedText type="default">{item.name}</ThemedText>
                    {item.description && (
                      <ThemedText
                        type="default"
                        style={[styles.listItemDescription, { color: placeholderColor }]}
                      >
                        {item.description}
                      </ThemedText>
                    )}
                  </View>

                  {status === 'pending' && <ActivityIndicator size="small" />}
                  {status === 'success' && (
                    <ThemedText style={[styles.statusText, { color: tint }]}>✓ Added</ThemedText>
                  )}
                  {status === 'error' && (
                    <ThemedText style={styles.statusTextError}>Failed — retry</ThemedText>
                  )}
                </Pressable>
              );
            }}
          />

          <View style={[styles.divider, { backgroundColor: borderColor }]} />

          <ThemedText type="default">Create a new event</ThemedText>
          <TextInput
            style={[
              styles.input,
              { borderColor, backgroundColor: inputBackground, color: textColor },
            ]}
            placeholder="Event name"
            placeholderTextColor={placeholderColor}
            value={newEventName}
            onChangeText={setNewEventName}
          />
          <TextInput
            style={[
              styles.input,
              { borderColor, backgroundColor: inputBackground, color: textColor },
            ]}
            placeholder="Description (optional)"
            placeholderTextColor={placeholderColor}
            value={newEventDescription}
            onChangeText={setNewEventDescription}
          />

          {(createEvent.isError || attachEvent.isError) && (
            <ThemedText type="default" style={styles.errorText}>
              Something went wrong. Please try again.
            </ThemedText>
          )}

          <Pressable
            style={[
              styles.createButton,
              { backgroundColor: tint },
              !newEventName.trim() && styles.createButtonDisabled,
            ]}
            onPress={handleCreateAndAttach}
            disabled={!newEventName.trim() || createEvent.isPending || attachEvent.isPending}
          >
            {createEvent.isPending || attachEvent.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <ThemedText style={styles.createButtonText}>Create & Add</ThemedText>
            )}
          </Pressable>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({

  eventHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  },

  expandIcon: {
    fontSize: 20,
    opacity: 0.6,
    marginLeft: Spacing.two,
  },

  eventList: {
    gap: Spacing.three,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6C5CE7',
    marginTop: 6,
  },
  eventTextWrap: {
    flex: 1,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '600',
  },
  eventDescription: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 2,
  },
  card: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#6C5CE7',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two ?? 8,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(108,92,231,0.15)',
  },
  chipText: {
    fontSize: 13,
  },
  placeholder: {
    opacity: 0.6,
  },
  errorText: {
    color: '#E57373',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    maxHeight: '80%',
    padding: Spacing.four,
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    gap: Spacing.three,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  list: {
    maxHeight: 200,
  },
  listItem: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two ?? 8,
  },
  listItemTextWrap: {
    flex: 1,
  },
  listItemDescription: {
    fontSize: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextError: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E57373',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  createButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});