import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { CheckCircle, AlertTriangle, XCircle, Clock, HelpCircle } from "lucide-react";
import { HowItWorksDialog } from "@/components/dialogs/HowItWorksDialog";

interface UniversityAverage {
  university: string;
  average: number;
  description: string;
  calculation: string;
  status: 'excellent' | 'good' | 'average' | 'needs-improvement';
  programs: number;
  acceptanceProbability: number;
  detailedResults?: any;
}

interface UniversityResultsTableProps {
  averages: UniversityAverage[];
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'excellent':
      return {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        text: 'מצוין',
        bgClass: 'bg-green-50'
      };
    case 'good':
      return {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: CheckCircle,
        text: 'טוב',
        bgClass: 'bg-blue-50'
      };
    case 'average':
      return {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
        text: 'בינוני',
        bgClass: 'bg-yellow-50'
      };
    case 'needs-improvement':
      return {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: AlertTriangle,
        text: 'דורש שיפור',
        bgClass: 'bg-red-50'
      };
    default:
      return {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: XCircle,
        text: 'לא ידוע',
        bgClass: 'bg-gray-50'
      };
  }
};

export const UniversityResultsTable: React.FC<UniversityResultsTableProps> = ({ averages }) => {
  const [selectedSechem, setSelectedSechem] = useState<{
    score: any;
    universityName: string;
    userAverage: number;
  } | null>(null);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          תוצאות חישוב הממוצעים לפי אוניברסיטאות
        </CardTitle>
        <p className="text-center text-muted-foreground">
          סיכום הממוצעים והציונים שלך בכל אוניברסיטה
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">אוניברסיטה</TableHead>
                <TableHead className="text-right">ממוצע</TableHead>
                <TableHead className="text-right">ציוני סכם</TableHead>
                <TableHead className="text-right">סטטוס</TableHead>
                <TableHead className="text-right">תוכניות מתאימות</TableHead>
                <TableHead className="text-right">אחוז הצלחה</TableHead>
                <TableHead className="text-right">הסבר חישוב</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {averages.map((avg, index) => {
                const statusConfig = getStatusConfig(avg.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <TableRow key={index} className={statusConfig.bgClass}>
                    <TableCell className="font-medium">
                      <div className="font-semibold text-lg">
                        {avg.university}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-primary">
                          {avg.average}
                        </span>
                        <Progress 
                          value={Math.min(100, (avg.average / 100) * 100)} 
                          className="w-20 h-2"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {avg.detailedResults?.sechem_scores ? (
                          <div className="space-y-1">
                            {avg.detailedResults.sechem_scores.map((sechem: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-2">
                                <div className="flex flex-col">
                                  <span className="font-medium text-xs text-muted-foreground">
                                    {sechem.name}
                                  </span>
                                  <span className={`font-bold ${sechem.score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {sechem.score.toFixed(1)}
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-primary/10"
                                  onClick={() => setSelectedSechem({
                                    score: sechem,
                                    universityName: avg.university,
                                    userAverage: avg.average
                                  })}
                                >
                                  <HelpCircle className="h-3 w-3 text-muted-foreground hover:text-primary" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-muted-foreground">
                            {avg.description.includes('סכם:') 
                              ? avg.description.split('סכם: ')[1] 
                              : 'לא זמין'}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig.color}>
                        <StatusIcon className="w-3 h-3 ml-1" />
                        {statusConfig.text}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-primary">
                          {Math.max(0, avg.programs)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          תוכניות
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">
                          {Math.max(0, Math.min(100, avg.acceptanceProbability))}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          סיכוי קבלה
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground max-w-xs">
                        {avg.calculation}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <HowItWorksDialog
        open={!!selectedSechem}
        onOpenChange={(open) => !open && setSelectedSechem(null)}
        universityName={selectedSechem?.universityName || ''}
        sechemScore={selectedSechem?.score || { type: '', name: '', score: 0, explanation: '' }}
        userAverage={selectedSechem?.userAverage}
        psychometricScore={650} // TODO: Get from user data
      />
    </Card>
  );
};