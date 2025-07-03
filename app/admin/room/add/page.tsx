import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AddRoomPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Өрөө нэмэх</h1>
        <p className="text-muted-foreground">Шинэ өрөө бүртгэх</p>
      </div>

      {/* Add Room Form */}
      <Card>
        <CardHeader>
          <CardTitle>Өрөөний мэдээлэл</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Өрөө нэмэх форм энд байрлана.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}