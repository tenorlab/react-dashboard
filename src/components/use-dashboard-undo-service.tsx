// file: use-dashboard-undo-service.tsx
import { useState, useCallback } from 'react'
import type {
  IDashboardConfig,
  TUndoHistoryEntry,
  TDashboardUndoStatus,
} from '@tenorlab/dashboard-core'

export const useDashboardUndoService = () => {
  // State to hold the history: { 'dashboardId': [entry, entry, ...] }
  const [undoHistory, setUndoHistory] = useState<Record<string, TUndoHistoryEntry[]>>({})

  // State to track the current index for each dashboard: { 'dashboardId': index }
  const [historyIndex, setHistoryIndex] = useState<Record<string, number>>({})

  // --- Helper Logic ---
  // const loadConfigFromHistory = useCallback(
  //   (dashboardId: string, index: number) => {
  //     // 1. Get the target config from history
  //     const history = undoHistory[dashboardId]
  //     if (history && index >= 0 && index < history.length) {
  //       const configToLoad = history[index].config
  //       // 2. Set this config as the current dashboard config in your store/state
  //       onHistoryLoad(configToLoad)
  //     }
  //   },
  //   [undoHistory, onHistoryLoad],
  // )

  // --- Core Functions ---

  /**
   * Initializes history with a starting config (always index 0) and CLEARs any previous history for the given ID.
   * This is called when editing begins.
   * @param initialConfig The configuration to save as the base state (index 0).
   */
  const initializeHistoryForDashboard = useCallback((initialConfig: IDashboardConfig) => {
    const dashboardId = initialConfig.dashboardId
    setUndoHistory((prevHistory) => {
      const newEntry: TUndoHistoryEntry = {
        undoIndex: 0,
        config: initialConfig,
      }

      // 1. Set the index state to 0 for this dashboard (resets index)
      setHistoryIndex((prevIndices) => ({
        ...prevIndices,
        [dashboardId]: 0,
      }))

      // 2. Return new history map, overwriting (resetting) history for this specific ID
      return {
        ...prevHistory,
        [dashboardId]: [newEntry], // Forces a reset to just this one entry
      }
    })
  }, [])

  /**
   * Adds a new undo entry for the specified dashboardId to the undo History, trimming any existing redo history.
   * @param newConfig The latest configuration to save in history.
   */
  const addUndoEntry = useCallback(
    (newConfig: IDashboardConfig) => {
      setUndoHistory((prevHistory) => {
        const dashboardId = newConfig.dashboardId
        const currentHistory = prevHistory[dashboardId] || []
        const currentIndex = historyIndex[dashboardId] ?? -1

        // 1. Trim the history: discard any entries after the current index (the redo list)
        // If currentIndex is -1 (initial state), trimHistory is an empty array.
        // If currentIndex is 5, we keep indices 0 through 5 (length 6).
        const trimmedHistory = currentHistory.slice(0, currentIndex + 1)

        // 2. Define the new entry
        const newEntry: TUndoHistoryEntry = {
          undoIndex: trimmedHistory.length, // New index based on trimmed length
          config: newConfig,
        }

        // 3. Create the new history array
        const newDashboardHistory = [...trimmedHistory, newEntry]

        // 4. Update the index state
        setHistoryIndex((prevIndices) => ({
          ...prevIndices,
          [dashboardId]: newDashboardHistory.length - 1, // Index is now the last element's index
        }))

        // 5. Return the new history map (immutable update)
        return {
          ...prevHistory,
          [dashboardId]: newDashboardHistory,
        }
      })
    },
    [historyIndex],
  ) // historyIndex is needed to calculate trimmedHistory

  /**
   * Removes the entire history for a deleted dashboard.
   */
  const removeUndoHistoryForDashboard = useCallback((dashboardId: string) => {
    setUndoHistory((prevHistory) => {
      // 1. If the history doesn't exist, return the previous state unchanged.
      if (!prevHistory[dashboardId]) {
        return prevHistory
      }

      // 2. Create a NEW history object by extracting the key to be deleted.
      // The key that matches dashboardId is excluded (deleted) from the new state.
      const { [dashboardId]: historyToRemove, ...restOfHistory } = prevHistory
      // 3. Return the new object containing only the remaining dashboard histories.
      return restOfHistory
    })

    // Also remove the index tracker for this dashboard
    setHistoryIndex((prevIndices) => {
      const { [dashboardId]: indexToRemove, ...restOfIndices } = prevIndices
      return restOfIndices
    })
  }, [])

  /**
   * Moves the history pointer one step back (decrements index).
   */
  const undo = useCallback(
    (currentDashboardId: string) => {
      setHistoryIndex((prevIndices) => {
        const currentIndex = prevIndices[currentDashboardId] ?? -1
        const newIndex = Math.max(0, currentIndex - 1) // Cannot go below index 0

        if (newIndex !== currentIndex) {
          // // Load the configuration at the new (previous) index
          // loadConfigFromHistory(currentDashboardId, newIndex)

          // Return the updated index
          return { ...prevIndices, [currentDashboardId]: newIndex }
        }
        return prevIndices // Index didn't change (at beginning)
      })
    },
    [
      //loadConfigFromHistory
    ],
  )

  /**
   * Moves the history pointer one step forward (increments index).
   */
  const redo = useCallback(
    (currentDashboardId: string) => {
      setHistoryIndex((prevIndices) => {
        const historyLength = undoHistory[currentDashboardId]?.length || 0
        const currentIndex = prevIndices[currentDashboardId] ?? -1

        // Cannot go past the last element's index
        const newIndex = Math.min(historyLength - 1, currentIndex + 1)

        if (newIndex !== currentIndex) {
          // Load the config at the new (next) index
          //loadConfigFromHistory(currentDashboardId, newIndex)

          // Return the updated index
          return { ...prevIndices, [currentDashboardId]: newIndex }
        }
        return prevIndices // Index didn't change (at end)
      })
    },
    [
      undoHistory,
      //loadConfigFromHistory,
    ],
  )

  // --- Disabled Status Calculation ---

  const getUndoStatus = (currentDashboardId: string): TDashboardUndoStatus => {
    const currentIndex = historyIndex[currentDashboardId] ?? -1
    const historyLength = undoHistory[currentDashboardId]?.length || 0

    // Disabled if at the beginning (index 0) or if no history exists (length 0)
    const isUndoDisabled = currentIndex <= 0

    // Disabled if at the end (index = length - 1)
    const isRedoDisabled = currentIndex >= historyLength - 1

    return { isUndoDisabled, isRedoDisabled }
  }

  return {
    initializeHistoryForDashboard,
    resetAllHistory: () => setUndoHistory({}),
    addUndoEntry,
    removeUndoHistoryForDashboard,
    undo,
    redo,
    getUndoStatus,
    undoHistory,
    historyIndex,
    // (Optional: You might expose undoHistory and historyIndex if needed for debugging)
  }
}

export type TDashboardUndoService = ReturnType<typeof useDashboardUndoService>
