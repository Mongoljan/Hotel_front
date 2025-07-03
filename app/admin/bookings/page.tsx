import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BookingsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Захиалга</h1>
        <p className="text-muted-foreground">Захиалгын удирдлага</p>
      </div>

      {/* Bookings Content */}
      <Card>
        <CardHeader>
          <CardTitle>Захиалгын жагсаалт</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Захиалгын мэдээлэл энд байрлана.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 