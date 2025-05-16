"use client"

import { useState } from "react"
import { User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useWallet } from "@/hooks/use-wallet"
import { ConnectWallet } from "@/components/connect-wallet"

export function AdminPage() {
  const { connected, address } = useWallet()
  const { toast } = useToast()

  const [userAddress, setUserAddress] = useState("")
  const [score, setScore] = useState(50)
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleScoreChange = (value: number[]) => {
    setScore(value[0])
  }

  const handleSubmit = async () => {
    if (!userAddress) {
      toast({
        title: "Missing Address",
        description: "Please enter a valid Stacks address.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      // Simulate blockchain transaction
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Reputation Updated",
        description: `Successfully updated reputation for ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}.`,
      })

      // Reset form
      setUserAddress("")
      setScore(50)
      setDescription("")
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update reputation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (!connected) {
    return <ConnectWallet />
  }

  // In a real app, we would check if the connected wallet has admin privileges
  const isAdmin = true

  if (!isAdmin) {
    return (
      <div className="container py-6">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You do not have permission to access the admin panel.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This area is restricted to protocol administrators only. If you believe this is an error, please contact
              support.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold bitcoin-gradient">Admin Panel</h1>
        <p className="text-muted-foreground">Manage protocol reputation and participation data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="web3-card">
          <CardHeader>
            <CardTitle>Push Reputation</CardTitle>
            <CardDescription>Update user reputation scores</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-address">User Address</Label>
              <Input
                id="user-address"
                placeholder="SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7"
                value={userAddress}
                onChange={(e) => setUserAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="reputation-score">Reputation Score</Label>
                <span className="text-sm font-medium">{score}</span>
              </div>
              <Slider
                id="reputation-score"
                max={100}
                min={0}
                step={1}
                value={[score]}
                onValueChange={handleScoreChange}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Negative</span>
                <span>Neutral</span>
                <span>Positive</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the reason for this reputation update..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full web3-button" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Processing..." : "Push Reputation Update"}
            </Button>
          </CardFooter>
        </Card>

        <Card className="web3-card">
          <CardHeader>
            <CardTitle>Recent Updates</CardTitle>
            <CardDescription>Latest reputation updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Mock data for recent updates */}
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7</span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span>Score: +75</span>
                  <span className="text-muted-foreground">2 hours ago</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Consistent loan repayments and active protocol participation
                </p>
              </div>

              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">SP1HTBVD3JG1PJZZX2J8FIABE6MNDZ6VS5TSTGZJM</span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span>Score: +60</span>
                  <span className="text-muted-foreground">5 hours ago</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Contributed to protocol governance and community support
                </p>
              </div>

              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE</span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span>Score: -20</span>
                  <span className="text-muted-foreground">1 day ago</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Late loan repayment</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full web3-input">
              View All Updates
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card className="web3-card">
        <CardHeader>
          <CardTitle>Protocol Statistics</CardTitle>
          <CardDescription>Overview of protocol performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Total Users</div>
              <div className="text-3xl font-bold">1,245</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Active Loans</div>
              <div className="text-3xl font-bold">87</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Total Value Locked</div>
              <div className="text-3xl font-bold">156.78 sBTC</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Default Rate</div>
              <div className="text-3xl font-bold">2.4%</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Average Credit Score</div>
              <div className="text-3xl font-bold">685</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Protocol Revenue</div>
              <div className="text-3xl font-bold">3.42 sBTC</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
