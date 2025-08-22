"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, Edit2, Trash2, Plus, Check } from "lucide-react"
import { useWorkoutStorage } from "@/hooks/use-workout-storage"

export function GoalManager() {
  const { dailyGoals, setGoal, editGoal, resetGoal, getAllGoalsProgress } = useWorkoutStorage()
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<string | null>(null)
  const [newGoal, setNewGoal] = useState({ exerciseType: "pushups", targetReps: 10 })
  const [editValue, setEditValue] = useState(0)

  const exerciseTypes = ["pushups", "squats", "punches", "planks", "burpees"]
  const goalsProgress = getAllGoalsProgress()

  const handleAddGoal = () => {
    setGoal(newGoal.exerciseType, newGoal.targetReps)
    setShowAddGoal(false)
    setNewGoal({ exerciseType: "pushups", targetReps: 10 })
  }

  const handleEditGoal = (goalId: string) => {
    editGoal(goalId, editValue)
    setEditingGoal(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-400" />
          Daily Goals
        </h2>
        <Button onClick={() => setShowAddGoal(true)} className="bg-purple-600 hover:bg-purple-700" size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Add Goal
        </Button>
      </div>

      {/* Add New Goal */}
      {showAddGoal && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">Set New Goal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Exercise Type</label>
              <select
                value={newGoal.exerciseType}
                onChange={(e) => setNewGoal({ ...newGoal, exerciseType: e.target.value })}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600"
              >
                {exerciseTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Target Reps</label>
              <Input
                type="number"
                value={newGoal.targetReps}
                onChange={(e) => setNewGoal({ ...newGoal, targetReps: Number.parseInt(e.target.value) || 0 })}
                className="bg-gray-700 border-gray-600 text-white"
                min="1"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddGoal} className="bg-purple-600 hover:bg-purple-700">
                Set Goal
              </Button>
              <Button onClick={() => setShowAddGoal(false)} variant="outline" className="border-gray-600 text-gray-300">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goals Progress */}
      <div className="space-y-3">
        {goalsProgress.map((progress) => (
          <Card key={progress?.goal.id} className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-white font-medium capitalize">{progress?.goal.exerciseType}</div>
                  {progress?.isCompleted && (
                    <Badge className="bg-green-600 text-white">
                      <Check className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => {
                      setEditingGoal(progress?.goal.id || null)
                      setEditValue(progress?.goal.targetReps || 0)
                    }}
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-white"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => resetGoal(progress?.goal.id || "")}
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {editingGoal === progress?.goal.id ? (
                <div className="flex items-center gap-2 mb-3">
                  <Input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(Number.parseInt(e.target.value) || 0)}
                    className="bg-gray-700 border-gray-600 text-white w-20"
                    min="1"
                  />
                  <Button
                    onClick={() => handleEditGoal(progress?.goal.id || "")}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Save
                  </Button>
                  <Button
                    onClick={() => setEditingGoal(null)}
                    size="sm"
                    variant="outline"
                    className="border-gray-600 text-gray-300"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="text-gray-300 text-sm mb-3">
                  Target: {progress?.goal.targetReps} reps | Current: {progress?.currentReps} reps
                </div>
              )}

              {/* Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    progress?.isCompleted ? "bg-green-500" : "bg-purple-500"
                  }`}
                  style={{ width: `${progress?.progress}%` }}
                />
              </div>
              <div className="text-right text-xs text-gray-400 mt-1">{Math.round(progress?.progress || 0)}%</div>
            </CardContent>
          </Card>
        ))}

        {goalsProgress.length === 0 && (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <Target className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">No goals set yet</p>
              <p className="text-gray-500 text-sm">Add your first daily goal to start tracking progress</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
