"use client"

import Link from 'next/link'
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, ArrowUpRight, Award, CircleCheckIcon, CircleHelpIcon, CircleIcon, Facebook, Instagram, MenuIcon, Star, Target, Twitter, Users } from 'lucide-react';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AvatarImage } from '@radix-ui/react-avatar';
import { useEffect, useState } from 'react';
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Alert Dialog",
    href: "/docs/primitives/alert-dialog",
    description:
      "A modal dialog that interrupts the user with important content and expects a response.",
  },
  {
    title: "Hover Card",
    href: "/docs/primitives/hover-card",
    description:
      "For sighted users to preview content available behind a link.",
  },
  {
    title: "Progress",
    href: "/docs/primitives/progress",
    description:
      "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
  },
  {
    title: "Scroll-area",
    href: "/docs/primitives/scroll-area",
    description: "Visually or semantically separates content.",
  },
  {
    title: "Tabs",
    href: "/docs/primitives/tabs",
    description:
      "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
  },
  {
    title: "Tooltip",
    href: "/docs/primitives/tooltip",
    description:
      "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
  },
]

const data = [
  { date: '2024-01-01', connections: 10 },
  { date: '2024-01-04', connections: 12 },
  { date: '2024-01-07', connections: 11 },
  { date: '2024-01-10', connections: 14 },
  { date: '2024-01-13', connections: 13 },
  { date: '2024-01-16', connections: 16 },
  { date: '2024-01-19', connections: 15 },
  { date: '2024-01-22', connections: 18 },
  { date: '2024-01-25', connections: 17 },
  { date: '2024-01-28', connections: 20 },
  { date: '2024-01-31', connections: 19 },
  { date: '2024-02-03', connections: 22 },
  { date: '2024-02-06', connections: 21 },
  { date: '2024-02-09', connections: 24 },
  { date: '2024-02-12', connections: 23 },
  { date: '2024-02-15', connections: 26 },
  { date: '2024-02-18', connections: 25 },
  { date: '2024-02-21', connections: 28 },
  { date: '2024-02-24', connections: 27 },
  { date: '2024-02-27', connections: 30 },
  { date: '2024-03-01', connections: 29 },
  { date: '2024-03-04', connections: 32 },
  { date: '2024-03-07', connections: 31 },
  { date: '2024-03-10', connections: 34 },
  { date: '2024-03-13', connections: 33 },
  { date: '2024-03-16', connections: 36 },
  { date: '2024-03-19', connections: 35 },
  { date: '2024-03-22', connections: 38 },
  { date: '2024-03-25', connections: 37 },
  { date: '2024-03-28', connections: 40 },
  { date: '2024-03-31', connections: 39 },
  { date: '2024-04-03', connections: 42 },
  { date: '2024-04-06', connections: 41 },
  { date: '2024-04-09', connections: 44 },
  { date: '2024-04-12', connections: 43 },
  { date: '2024-04-15', connections: 46 },
  { date: '2024-04-18', connections: 45 },
  { date: '2024-04-21', connections: 48 },
  { date: '2024-04-24', connections: 47 },
  { date: '2024-04-27', connections: 50 },
  { date: '2024-04-30', connections: 49 },
  { date: '2024-05-03', connections: 52 },
  { date: '2024-05-06', connections: 51 },
  { date: '2024-05-09', connections: 54 },
  { date: '2024-05-12', connections: 53 },
  { date: '2024-05-15', connections: 56 },
  { date: '2024-05-18', connections: 55 },
  { date: '2024-05-21', connections: 58 },
  { date: '2024-05-24', connections: 57 },
  { date: '2024-05-27', connections: 60 },
  { date: '2024-05-30', connections: 59 },
  { date: '2024-06-02', connections: 62 },
  { date: '2024-06-05', connections: 61 },
  { date: '2024-06-08', connections: 64 },
  { date: '2024-06-11', connections: 63 },
  { date: '2024-06-14', connections: 66 },
  { date: '2024-06-17', connections: 65 },
  { date: '2024-06-20', connections: 68 },
  { date: '2024-06-23', connections: 67 },
  { date: '2024-06-26', connections: 70 },
  { date: '2024-06-29', connections: 69 }
];

const chartConfig = {
  connections: {
    label: "Connections",
    color: "var(--chart-1)"
  }
} satisfies ChartConfig

export default function Home() {
  const supabase = createClient();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState("90d");
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<any>(null);

  const filteredData = data.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-06-29")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  useEffect(() => {
    async function collectSession() {
      const session = await supabase.auth.getUser();
  setUser(session.data.user || null);

      // If the URL contains ?noRedirect=1 we should not auto-redirect when arriving from the Connect button.
      const params = new URLSearchParams(window.location.search);
      const noRedirect = params.get('noRedirect');

      if (session.data.user && noRedirect !== '1') {
        router.push("/requests");
      }
    }

    collectSession()
  }, []);

  return (
    <div className={`min-h-screen bg-background`}>
      {/* Navbar */}
      <div className={`sticky top-0 left-0 m-3.5 rounded-3xl bg-background/5 backdrop-blur-lg flex items-center p-3.5 justify-between`}>
        <Button variant={`outline`} size={`icon`} className={`cursor-pointer lg:hidden mr-5`}><MenuIcon /></Button>
        <h1 className={`text-3xl font-semibold font-sans text-foreground mr-auto lg:mr-0`}>Connect</h1>
        <NavigationMenu className={`hidden lg:block`} viewport={false}>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Home</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <a
                        className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-6 no-underline outline-hidden select-none focus:shadow-md"
                        href="/"
                      >
                        <div className="mt-4 mb-2 text-lg font-medium">
                          shadcn/ui
                        </div>
                        <p className="text-muted-foreground text-sm leading-tight">
                          Beautifully designed components built with Tailwind CSS.
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                  <ListItem href="/docs" title="Introduction">
                    Re-usable components built using Radix UI and Tailwind CSS.
                  </ListItem>
                  <ListItem href="/docs/installation" title="Installation">
                    How to install dependencies and structure your app.
                  </ListItem>
                  <ListItem href="/docs/primitives/typography" title="Typography">
                    Styles for headings, paragraphs, lists...etc
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Components</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  {components.map((component) => (
                    <ListItem
                      key={component.title}
                      title={component.title}
                      href={component.href}
                    >
                      {component.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link href="/docs">Docs</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>List</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[300px] gap-4">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link href="#">
                        <div className="font-medium">Components</div>
                        <div className="text-muted-foreground">
                          Browse all components in the library.
                        </div>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link href="#">
                        <div className="font-medium">Documentation</div>
                        <div className="text-muted-foreground">
                          Learn how to use the library.
                        </div>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link href="#">
                        <div className="font-medium">Blog</div>
                        <div className="text-muted-foreground">
                          Read our latest blog posts.
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Simple</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[200px] gap-4">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link href="#">Components</Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link href="#">Documentation</Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link href="#">Blocks</Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>With Icon</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[200px] gap-4">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link href="#" className="flex-row items-center gap-2">
                        <CircleHelpIcon />
                        Backlog
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link href="#" className="flex-row items-center gap-2">
                        <CircleIcon />
                        To Do
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link href="#" className="flex-row items-center gap-2">
                        <CircleCheckIcon />
                        Done
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <div className={`flex items-center gap-3.5`}>
          {user ? (
            <Link href={`/requests`}><Button className={`cursor-pointer`} variant={`default`}>Go to Requests</Button></Link>
          ) : (
            <Link href={`/login`}><Button className={`cursor-pointer`} variant={`default`}>Sign In</Button></Link>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <div className={`mt-20 w-5/6 mx-auto flex flex-col lg:flex-row lg:items-center `}>
        <div className={`w-full lg:w-1/2`}>
          <h1 className={`text-5xl/15 lg:text-7xl/20 font-semibold font-sans text-foreground text-left`}>Find your <span className={`font-serif font-normal italic`}>Perfect</span> Project Partner</h1>
          {/* <p className={`text-2xl mt-5 text-foreground/90`}>No more searching alone. Find your ideal project partners, powered by AI.</p> */}
          <div className="flex w-full items-center gap-2 mt-7.5 mb-10">
            <Input type="email" placeholder="someone@example.com" className={`h-12`} value={email} onChange={(e) => setEmail(e.target.value)} />
            <Link href={`/register?email=${email}`}><Button type="submit" variant="outline" className={`h-12 text-base cursor-pointer`}>
              Get Started
            </Button></Link>
          </div>
        </div>
        <div className={`w-full lg:w-1/2 flex lg:justify-end items-center`}>
          <Card className={`w-full lg:w-9/12`}>
            <CardContent>
              <CardDescription className={`flex items-center gap-1 mb-5`}><Star className={`text-yellow-300 fill-yellow-300`} size={20} /><Star size={20} className={`text-yellow-300 fill-yellow-300`} /><Star size={20} className={`text-yellow-300 fill-yellow-300`} /><Star size={20} className={`text-yellow-300 fill-yellow-300`} /><Star size={20} className={`text-yellow-300 fill-yellow-300`} /></CardDescription>
              <div className={`flex items-center justify-between`}>
                <div className={`flex flex-col gap-0.5`}>
                  <p className={`text-card-foreground text-lg font-semibold`}>Rachael Standall</p>
                  <p className={`text-foreground/80`}>New York, U.S.A</p>
                </div>
                <Avatar className={`rounded-lg size-10`}>
                  <AvatarImage src={`https://github.com/shadcn.png`} alt={`@shadcn`} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </div>
              <p className={`text-card-foreground/90 mt-4`}>
                Connect helped me find the perfect teammates for my science fair project, leading us to win first place!
              </p>
            </CardContent>
            <CardFooter>
              <p className={`px-3 py-1 rounded-md bg-white/10 text-sm`}>High School Junior</p>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Our Approach */}
      <div className={`my-20 w-5/6 mx-auto rounded-xl bg-card p-15`}>
        <div className={`flex flex-col lg:flex-row lg:items-center lg:justify-between`}>
          <p className={`text-5xl font-sans text-card-foreground lg:w-7/12`}>Collaborate to elevate your potential</p>
          <div className={`lg:w-5/12 flex items-center justify-center`}>
            <p className={`lg:w-5/6 mt-5 lg:mt-0 text-card-foreground/85 text-sm`}>Connect empowers high school students to find the perfect teammates, transforming individual aspirations into shared successes.</p>
          </div>
        </div>
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-12 mt-15`}>
          <div className={`flex flex-col gap-1`}>
            <Users size={30} />
            <p className={`mt-2 text-xl font-semibold font-sans text-white`}>Smart Matching</p>
            <p className={`text-card-foreground/90`}>Our AI-powered matching algorithm analyzes your preferences, skills, and interests to find the perfect project partners.</p>
          </div>
          <div className={`flex flex-col gap-1`}>
            <Target size={30} />
            <p className={`mt-2 text-lg font-semibold text-white`}>Project Focus</p>
            <p className={`text-card-foreground/90`}>From ISEF research to hackathons and nonprofits, find partners for any project type.</p>
          </div>
          <div className={`flex flex-col gap-1`}>
            <Award size={30} />
            <p className={`mt-2 text-lg font-semibold text-white`}>Achievement Focused</p>
            <p className={`text-card-foreground/90`}>Connect with students who have competition experience and verified achievements.</p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className={`mb-20 w-5/6 mx-auto`}>
        <p className={`lg:text-5xl/14 font-sans text-card-foreground text-center text-4xl/12 lg:text-left lg:w-8/12`}>Produce innovative solutions with the perfect teammates.</p>
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-5 mt-7.5`}>
          <div className={`flex flex-col gap-3 bg-card p-5 rounded-xl w-full`}>
            <div className={`flex items-center justify-between`}>
              <p className={`text-lg text-foreground`}>Start your Account</p>
              <p className={`px-3 py-1 font-medium flex items-center justify-center rounded-full bg-foreground text-background text-xl`}>1</p>
            </div>
          </div>
          <div className={`flex flex-col gap-3 bg-card p-5 rounded-xl w-full`}>
            <div className={`flex items-center justify-between`}>
              <p className={`text-lg text-foreground`}>Post or Find Collab Requests</p>
              <p className={`px-3 py-1 font-medium flex items-center justify-center rounded-full bg-foreground text-background text-xl`}>2</p>
            </div>
          </div>
          <div className={`flex flex-col gap-3 bg-card p-5 rounded-xl w-full`}>
            <div className={`flex items-center justify-between`}>
              <p className={`text-lg text-foreground`}>Connect & Collaborate</p>
              <p className={`px-3 py-1 font-medium flex items-center justify-center rounded-full bg-foreground text-background text-xl`}>3</p>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Connect */}
      <div className={`mb-20 w-9/12 mx-auto`}>
        <p className={`text-4xl lg:text-5xl font-sans text-foreground text-center`}>Why Choose Connect</p>
        <div className={`grid grid-cols-2 gap-5 mt-7.5`}>
          <div className={`col-span-2 lg:col-span-1 bg-card border border-border rounded-xl p-7.5`}>
            <p className={`text-7xl font-sans mb-7.5 text-primary`}>3k+</p>
            <p className={`text-xl text-card-foreground`}>Members already collaborating on Connect</p>
          </div>
          <div className={`col-span-2 lg:col-span-1 bg-card border border-border rounded-xl p-7.5`}>
            <p className={`text-xl text-card-foreground mb-8.5`}>Instantly connect with your matches through their shared contact info.</p>
            <div className={`flex items-center gap-4 mx-auto w-fit`}>
              <Avatar className={`rounded-lg size-15`}>
                <AvatarImage src={`https://github.com/nikrp.png`} />
                <AvatarFallback>NP</AvatarFallback>
              </Avatar>
              <ArrowRightLeft size={30} className={`mx-3`} />
              <Avatar className={`rounded-lg size-15`}>
                <AvatarImage src={`https://github.com/shadcn.png`} />
                <AvatarFallback>NP</AvatarFallback>
              </Avatar>
            </div>
          </div>
          <div className={`bg-card border border-border rounded-xl p-7.5 col-span-2 flex flex-col lg:flex-row lg:items-start gap-13`}>
            <div className={`lg:w-5/12`}>
              <p className={`text-4xl/13 text-card-foreground mb-1.5`}>Grow your network.</p>
              <p className={`text-base text-card-foreground`}>Connect with ambitious peers and watch your skills and projects flourish as you team up with the right individuals.</p>
            </div>
            <div className={`lg:w-6/12 max-h-[200px] overflow-hidden`}>
              <Card>
                <CardHeader>
                  <CardTitle>Total Connections</CardTitle>
                  <CardDescription>Showing total over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className={`aspect-auto h-[250px] w-full`}>
                    <AreaChart data={filteredData}>
                      <defs>
                        <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor="var(--color-connections)"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="var(--color-connections)"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        minTickGap={32}
                        tickFormatter={(value: any) => {
                          const date = new Date(value)
                          return date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        }}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent 
                            payload={[]}
                            coordinate={{ x: 0, y: 0 }}
                            active={false}
                            accessibilityLayer={false}
                            labelFormatter={(value) => {
                              return new Date(value).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })
                            }}
                            indicator="dot"
                          />
                        }
                      />
                      <Area
                        dataKey="connections"
                        type="natural"
                        fill="url(#fillDesktop)"
                        stroke="var(--color-connections)"
                        stackId="a"
                      />
                      <ChartLegend content={<ChartLegendContent payload={[]} verticalAlign="middle" />} align={`center`} />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className={`mb-20 w-5/6 mx-auto bg-gradient-to-bl from-card to-card/75 p-15 rounded-xl flex flex-col lg:flex-row items-center gap-10`}>
        <p className={`text-center lg:text-left text-4xl/15 text-card-foreground font-sans lg:w-7/12`}>Ready to work with the best teams?</p>
        <div className={`lg:w-5/12 flex items-center justify-center gap-5`}>
          <Button variant={`default`} size={`lg`} className={`cursor-pointer text-lg`}>Get Started</Button>
          <Button variant={`ghost`} size={`lg`} className={`cursor-pointer flex items-center gap-1.5 text-lg transition-all`}>Learn More <ArrowUpRight /></Button>
        </div>
      </div>

      <div className={`w-5/6 mx-auto flex flex-col lg:flex-row lg:justify-between mb-10 gap-20`}>
        <div className={`flex flex-col gap-3 text-center lg:text-left`}>
          <h1 className={`text-3xl font-semibold font-sans text-foreground`}>Connect</h1>
          <p className={`text-foreground/85 text-sm`}>&copy; 2025 Connect. All rights reserved.</p>
        </div>
        <div className={`flex flex-col gap-10 lg:gap-0 lg:flex-row items-center justify-between lg:w-4/6 text-center lg:text-left`}>
          <div className={`flex flex-col gap-4`}>
            <p className={`text-lg font-sans text-white`}>Company</p>
            <div className={`flex flex-col gap-2.5`}>
              <p className={`text-base font-sans cursor-pointer hover:text-white transition-all text-foreground/95`}>About Us</p>
              <p className={`text-base font-sans cursor-pointer hover:text-white transition-all text-foreground/95`}>Mission</p>
              <p className={`text-base font-sans cursor-pointer hover:text-white transition-all text-foreground/95`}>Contact Us</p>
            </div>
          </div>
          <div className={`flex flex-col gap-4`}>
            <p className={`text-lg font-sans text-white`}>Product</p>
            <div className={`flex flex-col gap-2.5`}>
              <p className={`text-base font-sans cursor-pointer hover:text-white transition-all text-foreground/95`}>How it Works</p>
              <p className={`text-base font-sans cursor-pointer hover:text-white transition-all text-foreground/95`}>Key Features</p>
              <p className={`text-base font-sans cursor-pointer hover:text-white transition-all text-foreground/95`}>Testimonials</p>
            </div>
          </div>
          <div className={`flex flex-col gap-4`}>
            <p className={`text-lg font-sans text-white`}>Resources</p>
            <div className={`flex flex-col gap-2.5`}>
              <p className={`text-base font-sans cursor-pointer hover:text-white transition-all text-foreground/95`}>FAQ</p>
              <p className={`text-base font-sans cursor-pointer hover:text-white transition-all text-foreground/95`}>Blog</p>
              <p className={`text-base font-sans cursor-pointer hover:text-white transition-all text-foreground/95`}>Help Center</p>
            </div>
          </div>
          <div className={`flex flex-col gap-4`}>
            <p className={`text-lg font-sans text-white`}>Legal</p>
            <div className={`flex flex-col gap-2.5`}>
              <p className={`text-base font-sans cursor-pointer hover:text-white transition-all text-foreground/95`}>Privacy Policy</p>
              <p className={`text-base font-sans cursor-pointer hover:text-white transition-all text-foreground/95`}>Terms of Service</p>
              <p className={`text-base font-sans cursor-pointer hover:text-white transition-all text-foreground/95`}>Cookie Policy</p>
            </div>
          </div>
        </div>
        <div className={`lg:w-1/6 flex items-center lg:items-start flex-col gap-2`}>
          <p className={`text-foreground text-sm`}>Follow Us On</p>
          <div className={`flex items-center gap-1.5`}>
            <Button variant={`outline`} size={`icon`} className={`cursor-pointer`}><Instagram /></Button>
            <Button variant={`outline`} size={`icon`} className={`cursor-pointer`}><Facebook /></Button>
            <Button variant={`outline`} size={`icon`} className={`cursor-pointer`}><Twitter /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href}>
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}