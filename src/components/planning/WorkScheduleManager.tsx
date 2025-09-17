import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus, Edit2, Trash2, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface WorkSchedule {
  id: string;
  name: string;
  schedule: any; // Using any for now to handle the Json type from Supabase
  is_default: boolean;
}

const DAYS_OF_WEEK = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

export function WorkScheduleManager() {
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<WorkSchedule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    schedule: DAYS_OF_WEEK.reduce((acc, day) => ({
      ...acc,
      [day]: { is_working: false, start_time: '09:00', end_time: '17:00' }
    }), {}),
  });
  const { toast } = useToast();

  const loadSchedules = async () => {
    const { data, error } = await supabase
      .from('work_schedules')
      .select('*')
      .order('is_default', { ascending: false })
      .order('name');

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load work schedules",
        variant: "destructive",
      });
      return;
    }

    setSchedules(data || []);
  };

  const handleSaveSchedule = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Schedule name is required",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save schedules",
        variant: "destructive",
      });
      return;
    }

    const scheduleData = {
      user_id: user.id,
      name: formData.name,
      schedule: formData.schedule,
      is_default: schedules.length === 0, // First schedule becomes default
    };

    let error;
    if (editingSchedule) {
      ({ error } = await supabase
        .from('work_schedules')
        .update(scheduleData)
        .eq('id', editingSchedule.id));
    } else {
      ({ error } = await supabase
        .from('work_schedules')
        .insert(scheduleData));
    }

    if (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingSchedule ? 'update' : 'create'} work schedule`,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: `Work schedule ${editingSchedule ? 'updated' : 'created'} successfully!`,
    });

    setIsDialogOpen(false);
    resetForm();
    loadSchedules();
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    const { error } = await supabase
      .from('work_schedules')
      .delete()
      .eq('id', scheduleId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete work schedule",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Work schedule deleted successfully!",
    });

    loadSchedules();
  };

  const handleSetDefault = async (scheduleId: string) => {
    // First, unset all defaults
    await supabase
      .from('work_schedules')
      .update({ is_default: false })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all rows

    // Then set the selected one as default
    const { error } = await supabase
      .from('work_schedules')
      .update({ is_default: true })
      .eq('id', scheduleId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to set default schedule",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Default schedule updated!",
    });

    loadSchedules();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      schedule: DAYS_OF_WEEK.reduce((acc, day) => ({
        ...acc,
        [day]: { is_working: false, start_time: '09:00', end_time: '17:00' }
      }), {}),
    });
    setEditingSchedule(null);
  };

  const openEditDialog = (schedule: WorkSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      name: schedule.name,
      schedule: schedule.schedule,
    });
    setIsDialogOpen(true);
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day],
          is_working: !prev.schedule[day].is_working
        }
      }
    }));
  };

  const handleTimeChange = (day: string, field: 'start_time' | 'end_time', value: string) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day],
          [field]: value
        }
      }
    }));
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Work Schedules</h2>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Schedule
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {schedules.map((schedule) => (
          <Card key={schedule.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {schedule.name}
                  {schedule.is_default && (
                    <Badge variant="default">Default</Badge>
                  )}
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEditDialog(schedule)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => handleDeleteSchedule(schedule.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-2">
              {DAYS_OF_WEEK.map((day) => {
                const daySchedule = schedule.schedule[day];
                return (
                  <div key={day} className="flex items-center justify-between text-sm">
                    <span className="capitalize font-medium">{day}</span>
                    {daySchedule.is_working ? (
                      <div className="flex items-center gap-1 text-primary">
                        <Clock className="h-3 w-3" />
                        {daySchedule.start_time} - {daySchedule.end_time}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Off</span>
                    )}
                  </div>
                );
              })}
              
              {!schedule.is_default && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSetDefault(schedule.id)}
                  className="w-full mt-3"
                >
                  Set as Default
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSchedule ? 'Edit' : 'Add'} Work Schedule
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="schedule_name">Schedule Name *</Label>
              <Input
                id="schedule_name"
                placeholder="e.g., Standard Work Week"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div>
              <Label>Weekly Schedule</Label>
              <div className="space-y-3 mt-2">
                {DAYS_OF_WEEK.map((day) => {
                  const daySchedule = formData.schedule[day];
                  return (
                    <div key={day} className="flex items-center gap-4">
                      <div className="w-20">
                        <input
                          type="checkbox"
                          checked={daySchedule.is_working}
                          onChange={() => handleDayToggle(day)}
                          className="mr-2"
                        />
                        <span className="capitalize text-sm font-medium">{day}</span>
                      </div>
                      
                      {daySchedule.is_working && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={daySchedule.start_time}
                            onChange={(e) => handleTimeChange(day, 'start_time', e.target.value)}
                            className="w-24"
                          />
                          <span className="text-sm text-muted-foreground">to</span>
                          <Input
                            type="time"
                            value={daySchedule.end_time}
                            onChange={(e) => handleTimeChange(day, 'end_time', e.target.value)}
                            className="w-24"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSchedule}>
                {editingSchedule ? 'Update' : 'Create'} Schedule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}