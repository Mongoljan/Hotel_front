import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GuestsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Зочид</h1>
        <p className="text-muted-foreground">Зочдын удирдлага</p>
      </div>

      {/* Guests Content */}
      <Card>
        <CardHeader>
          <CardTitle>Зочдын жагсаалт</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Зочдын мэдээлэл энд байрлана.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 