
//import { type NextRequest, NextResponse } from "next/server";

//export const createClient = (request: NextRequest) => {
  // Create an unmodified response
//  let supabaseResponse = NextResponse.next({
//    request: {
//      headers: request.headers,
//    },
//  });

//  const supabase = createServerClient(
//    supabaseUrl!,
//    supabaseKey!,
//    {
//      cookies: {
//        getAll() {
//          return request.cookies.getAll()
//        },
//        setAll(cookiesToSet) {
//          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
//          supabaseResponse = NextResponse.next({
//            request,
//          })
//          cookiesToSet.forEach(({ name, value, options }) =>
//            supabaseResponse.cookies.set(name, value, options)
//          )
//        },
//      },
//    },
//  );
//
//  return supabaseResponse
//};
