import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Хяналтын самбар</h1>
        <p className="text-muted-foreground">Өнөөдрийн тойм мэдээлэл</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Нийт өрөө</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+2 өмнөх сараас</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Өнөөдрийн захиалга</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+3 өчигдрөөс</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Нийт зочин</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">+12 энэ долоо хоногт</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Орлого</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₮2,340,000</div>
            <p className="text-xs text-muted-foreground">-5% өмнөх сараас</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Сүүлийн захиалгууд</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Батбаяр</p>
                  <p className="text-xs text-muted-foreground">Өрөө №101</p>
                </div>
                <div className="text-sm text-muted-foreground">1 цаг өмнө</div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Сарангэрэл</p>
                  <p className="text-xs text-muted-foreground">Өрөө №102</p>
                </div>
                <div className="text-sm text-muted-foreground">2 цаг өмнө</div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Болдбаатар</p>
                  <p className="text-xs text-muted-foreground">Өрөө №103</p>
                </div>
                <div className="text-sm text-muted-foreground">3 цаг өмнө</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Түргэн үйлдэл</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 text-center border rounded-lg hover:bg-accent">
                <div className="text-sm">Өрөө нэмэх</div>
              </button>
              <button className="p-4 text-center border rounded-lg hover:bg-accent">
                <div className="text-sm">Захиалга үзэх</div>
              </button>
              <button className="p-4 text-center border rounded-lg hover:bg-accent">
                <div className="text-sm">Зочин бүртгэх</div>
              </button>
              <button className="p-4 text-center border rounded-lg hover:bg-accent">
                <div className="text-sm">Тайлан үзэх</div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
