import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Heart, MapPin, Calendar, Users, Share } from 'lucide-react';

function PatientCard({ patient }) {
  const progressPercentage = (patient.raised / patient.target) * 100;

  const urgencyColors = {
    high: 'bg-destructive text-destructive-foreground',
    medium: 'bg-accent text-accent-foreground',
    low: 'bg-secondary text-secondary-foreground'
  };

  return React.createElement(
    Card,
    { className: "overflow-hidden border-0 shadow-soft hover:shadow-medium transition-all duration-300 group" },
    React.createElement(
      "div",
      { className: "relative" },
      React.createElement(
        "div",
        { className: "h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center" },
        React.createElement(
          "div",
          { className: "w-20 h-20 bg-white/90 rounded-full flex items-center justify-center" },
          React.createElement(Heart, { className: "h-10 w-10 text-primary" })
        )
      ),
      React.createElement(
        "div",
        { className: "absolute top-3 left-3 flex gap-2" },
        React.createElement(
          Badge,
          { className: urgencyColors[patient.urgency], variant: "secondary" },
          patient.urgency === "high" ? "Critical" : patient.urgency === "medium" ? "Urgent" : "Standard"
        ),
        patient.verified ? React.createElement(
          Badge,
          { variant: "secondary", className: "bg-secondary text-secondary-foreground" },
          "\u2713 Verified"
        ) : null
      ),
      React.createElement(
        Button,
        {
          variant: "ghost",
          size: "sm",
          className: "absolute top-3 right-3 bg-white/90 hover:bg-white"
        },
        React.createElement(Share, { className: "h-4 w-4" })
      )
    ),
    React.createElement(
      CardContent,
      { className: "p-6" },
      React.createElement("div", { className: "mb-2 flex items-center gap-2" },
        React.createElement(MapPin, { className: "h-4 w-4 text-muted-foreground" }),
        React.createElement("span", { className: "text-sm text-muted-foreground" }, patient.location)
      ),
      React.createElement("h3", { className: "text-lg font-semibold mb-1" }, patient.name),
      React.createElement("div", { className: "flex items-center gap-2 mb-2" },
        React.createElement(Calendar, { className: "h-4 w-4 text-muted-foreground" }),
        React.createElement("span", { className: "text-sm text-muted-foreground" }, `Admitted: ${patient.admitted}`)
      ),
      React.createElement("div", { className: "flex items-center gap-2 mb-4" },
        React.createElement(Users, { className: "h-4 w-4 text-muted-foreground" }),
        React.createElement("span", { className: "text-sm text-muted-foreground" }, `Supporters: ${patient.supporters}`)
      ),
      React.createElement(Progress, {
        value: (patient.raised / patient.target) * 100,
        className: "mb-2"
      }),
      React.createElement("div", { className: "flex justify-between text-sm" },
        React.createElement("span", null, `Raised: ₹${patient.raised}`),
        React.createElement("span", null, `Goal: ₹${patient.target}`)
      )
    )
  );
}

export default PatientCard;
