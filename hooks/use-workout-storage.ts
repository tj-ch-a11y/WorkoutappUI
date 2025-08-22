"use client"

import { useState, useEffect } from "react"

export interface WorkoutSession {
  id: string
  date: string
  exerciseType: string
  count: number
  duration: number
  formScore: number
  calories: number
}

export interface DailyStats {
  date: string
  totalWorkouts: number
  totalReps: number
  totalDuration: number
  avgFormScore: number
  calories: number
}

export interface DailyGoal {
  id: string
  exerciseType: string
  targetReps: number
  isActive: boolean
  createdAt: string
}

export function useWorkoutStorage() {
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([])
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>([])

  useEffect(() => {
    // Load data from localStorage on mount
    const savedWorkouts = localStorage.getItem("fitness-workouts")
    if (savedWorkouts) {
      const workouts = JSON.parse(savedWorkouts)
      setWorkoutHistory(workouts)
      calculateDailyStats(workouts)
    }

    const savedGoals = localStorage.getItem("fitness-goals")
    if (savedGoals) {
      setDailyGoals(JSON.parse(savedGoals))
    }
  }, [])

  const saveWorkout = (session: Omit<WorkoutSession, "id">) => {
    const newSession: WorkoutSession = {
      ...session,
      id: Date.now().toString(),
    }

    const updatedWorkouts = [...workoutHistory, newSession]
    setWorkoutHistory(updatedWorkouts)
    localStorage.setItem("fitness-workouts", JSON.stringify(updatedWorkouts))
    calculateDailyStats(updatedWorkouts)
  }

  const calculateDailyStats = (workouts: WorkoutSession[]) => {
    const statsMap = new Map<string, DailyStats>()

    workouts.forEach((workout) => {
      const date = workout.date.split("T")[0] // Get date part only

      if (!statsMap.has(date)) {
        statsMap.set(date, {
          date,
          totalWorkouts: 0,
          totalReps: 0,
          totalDuration: 0,
          avgFormScore: 0,
          calories: 0,
        })
      }

      const stats = statsMap.get(date)!
      stats.totalWorkouts += 1
      stats.totalReps += workout.count
      stats.totalDuration += workout.duration
      stats.calories += workout.calories
    })

    // Calculate average form scores
    statsMap.forEach((stats, date) => {
      const dayWorkouts = workouts.filter((w) => w.date.split("T")[0] === date)
      const totalFormScore = dayWorkouts.reduce((sum, w) => sum + w.formScore, 0)
      stats.avgFormScore = Math.round(totalFormScore / dayWorkouts.length)
    })

    const statsArray = Array.from(statsMap.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )

    setDailyStats(statsArray)
  }

  const getWeeklyProgress = () => {
    const last7Days = dailyStats.slice(0, 7)
    return {
      totalWorkouts: last7Days.reduce((sum, day) => sum + day.totalWorkouts, 0),
      totalReps: last7Days.reduce((sum, day) => sum + day.totalReps, 0),
      totalDuration: last7Days.reduce((sum, day) => sum + day.totalDuration, 0),
      avgFormScore: Math.round(
        last7Days.reduce((sum, day) => sum + day.avgFormScore, 0) / Math.max(last7Days.length, 1),
      ),
      totalCalories: last7Days.reduce((sum, day) => sum + day.calories, 0),
    }
  }

  const getTodayStats = () => {
    const today = new Date().toISOString().split("T")[0]
    return (
      dailyStats.find((stats) => stats.date === today) || {
        date: today,
        totalWorkouts: 0,
        totalReps: 0,
        totalDuration: 0,
        avgFormScore: 0,
        calories: 0,
      }
    )
  }

  const setGoal = (exerciseType: string, targetReps: number) => {
    const newGoal: DailyGoal = {
      id: Date.now().toString(),
      exerciseType,
      targetReps,
      isActive: true,
      createdAt: new Date().toISOString(),
    }

    // Remove existing goal for same exercise type
    const updatedGoals = dailyGoals.filter((goal) => goal.exerciseType !== exerciseType)
    updatedGoals.push(newGoal)

    setDailyGoals(updatedGoals)
    localStorage.setItem("fitness-goals", JSON.stringify(updatedGoals))
  }

  const editGoal = (goalId: string, targetReps: number) => {
    const updatedGoals = dailyGoals.map((goal) => (goal.id === goalId ? { ...goal, targetReps } : goal))
    setDailyGoals(updatedGoals)
    localStorage.setItem("fitness-goals", JSON.stringify(updatedGoals))
  }

  const resetGoal = (goalId: string) => {
    const updatedGoals = dailyGoals.filter((goal) => goal.id !== goalId)
    setDailyGoals(updatedGoals)
    localStorage.setItem("fitness-goals", JSON.stringify(updatedGoals))
  }

  const getGoalProgress = (exerciseType: string) => {
    const goal = dailyGoals.find((g) => g.exerciseType === exerciseType && g.isActive)
    if (!goal) return null

    const today = new Date().toISOString().split("T")[0]
    const todayWorkouts = workoutHistory.filter(
      (w) => w.exerciseType === exerciseType && w.date.split("T")[0] === today,
    )
    const currentReps = todayWorkouts.reduce((sum, w) => sum + w.count, 0)

    return {
      goal,
      currentReps,
      progress: Math.min((currentReps / goal.targetReps) * 100, 100),
      isCompleted: currentReps >= goal.targetReps,
    }
  }

  const getAllGoalsProgress = () => {
    return dailyGoals
      .filter((g) => g.isActive)
      .map((goal) => getGoalProgress(goal.exerciseType))
      .filter(Boolean)
  }

  return {
    workoutHistory,
    dailyStats,
    dailyGoals,
    saveWorkout,
    getWeeklyProgress,
    getTodayStats,
    setGoal,
    editGoal,
    resetGoal,
    getGoalProgress,
    getAllGoalsProgress,
  }
}
