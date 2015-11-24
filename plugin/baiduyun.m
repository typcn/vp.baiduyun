//
//  vp-baiduyun.m
//  vp-baiduyun
//
//  Created by TYPCN on 2015/9/20.
//  Copyright © 2015 TYPCN. All rights reserved.
//

#import "baiduyun.h"

@interface baiduyun (){
    NSString *playAddr;
}

@property (strong) NSWindowController* settingsPanel;

@end

@implementation baiduyun

@synthesize settingsPanel;

- (bool)load:(int)version{
    
    NSLog(@"VP-baiduyun is loaded");
    
    return true;
}


- (bool)unload{
    
    return true;
}

- (void)CallAria2Download:(NSString *)downloadAddr fileName:(NSString *)fileName{
    NSURL* dURL = [NSURL URLWithString:downloadAddr];
    NSHTTPCookieStorage *cookieJar = [NSHTTPCookieStorage sharedHTTPCookieStorage];
    NSString *cookieStr = @"Cookie: BDUSS=";
    for (NSHTTPCookie *cookie in [cookieJar cookiesForURL:dURL])
    {
        if([[cookie name] isEqualToString:@"BDUSS"]){
            cookieStr = [cookieStr stringByAppendingString:cookie.value];
        }
    }
    
    for (NSHTTPCookie *cookie in [cookieJar cookiesForURL:dURL])
    {
        if([[cookie name] isEqualToString:@"pcsett"]){
            cookieStr = [cookieStr stringByAppendingString:@"; pcsett="];
            cookieStr = [cookieStr stringByAppendingString:cookie.value];
            
        }
    }
    
    
    NSLog(@"BaiduCookie: %@",cookieStr);
    
    NSString *path = [NSString stringWithFormat:@"%@%@/",NSHomeDirectory(),@"/Movies/Bilibili/BaiduYun/"];
    
    NSString *taskid = [NSString stringWithFormat:@"%ld",time(0)];
    NSURL* URL = [NSURL URLWithString:@"http://localhost:23336/jsonrpc"];
    NSMutableURLRequest* request = [NSMutableURLRequest requestWithURL:URL];
    request.HTTPMethod = @"POST";
    NSDictionary* bodyObject = @{
                                 @"jsonrpc": @"2.0",
                                 @"id": taskid,
                                 @"method": @"aria2.addUri",
                                 @"params": @[
                                         @[downloadAddr],
                                         @{
                                             @"dir": path,
                                             @"out": fileName,
                                             @"header": @[
                                                     @"User-Agent: netdisk;5.3.4.5;PC;PC-Windows;5.1.2600;WindowsBaiduYunGuanJia",
                                                     @"Referer: http://pan.baidu.com/disk/home",
                                                     cookieStr
                                                     ],
                                             @"split": @"10",
                                             @"max-connection-per-server" : @"10",
                                             @"min-split-size": @"1M"
                                             },
                                         ]
                                 };
    NSData *json = [NSJSONSerialization dataWithJSONObject:bodyObject options:kNilOptions error:NULL];
    request.HTTPBody = json;
    NSURLResponse * response = nil;
    NSError * error = nil;
    [NSURLConnection sendSynchronousRequest:request
                          returningResponse:&response
                                      error:&error];
    NSString *jsonstr = [[NSString alloc] initWithData:json encoding:NSUTF8StringEncoding];
    NSLog(@"Request sent, str: %@ ,resp: %@ , err: %@",jsonstr,response,error);
}

- (void)PreloadBaiduyunPlayAddr:(NSString *)videoAddr{
    NSURL* URL = [NSURL URLWithString:videoAddr];
    NSMutableURLRequest* request = [NSMutableURLRequest requestWithURL:URL];
    request.HTTPMethod = @"GET";

    NSUserDefaults *settingsController = [NSUserDefaults standardUserDefaults];
    NSString *xff = [settingsController objectForKey:@"xff"];
    if([xff length] > 4){
        [request setValue:xff forHTTPHeaderField:@"X-Forwarded-For"];
        [request setValue:xff forHTTPHeaderField:@"Client-IP"];
    }
    
    NSHTTPCookieStorage *cookieJar = [NSHTTPCookieStorage sharedHTTPCookieStorage];
    NSString *cookieStr = @"BDUSS=";
    for (NSHTTPCookie *cookie in [cookieJar cookiesForURL:URL])
    {
        if([[cookie name] isEqualToString:@"BDUSS"]){
            cookieStr = [cookieStr stringByAppendingString:cookie.value];
        }
    }
    
    for (NSHTTPCookie *cookie in [cookieJar cookiesForURL:URL])
    {
        if([[cookie name] isEqualToString:@"pcsett"]){
            cookieStr = [cookieStr stringByAppendingString:@"; pcsett="];
            cookieStr = [cookieStr stringByAppendingString:cookie.value];
            
        }
    }

    NSLog(@"BaiduCookie: %@",cookieStr);
    [request setValue:cookieStr forHTTPHeaderField:@"Cookie"];
    [request setValue:@"netdisk;5.3.4.5;PC;PC-Windows;5.1.2600;WindowsBaiduYunGuanJia" forHTTPHeaderField:@"User-Agent"];
    [request setValue:@"http://pan.baidu.com/disk/home" forHTTPHeaderField:@"Referer"];
    
    NSLog(@"Start send request");
    dispatch_async(dispatch_get_main_queue(), ^(void){
        NSLog(@"Is%@ main thread", ([NSThread isMainThread] ? @"" : @" NOT"));
        NSURLConnection* con = [NSURLConnection connectionWithRequest:request delegate:self];
        [con start];

    });
    NSLog(@"Request sent");
}

- (NSURLRequest *)connection: (NSURLConnection *)connection
             willSendRequest: (NSURLRequest *)request
            redirectResponse: (NSURLResponse *)redirectResponse;
{
    if (redirectResponse) {
        NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse*)redirectResponse;
        if ([httpResponse respondsToSelector:@selector(allHeaderFields)]) {
            NSDictionary *dictionary = [httpResponse allHeaderFields];
            NSString *url = dictionary[@"Location"];
            if(url && [url length] > 5){
                // Got Play Address
                NSURL* URL = [NSURL URLWithString:@"http://localhost:23330/pluginCall"];
                NSMutableURLRequest* request = [NSMutableURLRequest requestWithURL:URL];
                request.HTTPMethod = @"POST";
                [request setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
                NSDictionary* bodyObject = @{
                                             @"action": @"baiduyun-playInApp",
                                             @"data": url
                                             };
                request.HTTPBody = [NSJSONSerialization dataWithJSONObject:bodyObject options:kNilOptions error:NULL];
                NSURLConnection* connection = [NSURLConnection connectionWithRequest:request delegate:nil];
                [connection scheduleInRunLoop:[NSRunLoop mainRunLoop]
                               forMode:NSDefaultRunLoopMode];
                [connection start];
                NSLog(@"Play URL: %@",url);
            }
        }
        return nil;
    } else {
        return request;
    }
}

- (bool)canHandleEvent:(NSString *)eventName{
    // Eventname format is pluginName-str
    if([eventName containsString:@"baiduyun"]){
        return true;
    }
    return false;
}

- (NSString *)processEvent:(NSString *)eventName :(NSString *)eventData{
    
    if([eventName isEqualToString:@"baiduyun-playURL"]){
        [self PreloadBaiduyunPlayAddr:eventData];
    }else if([eventName isEqualToString:@"baiduyun-playInApp"]){
        return eventData; // return video url to play
    }else if([eventName isEqualToString:@"baiduyun-playQuickTime"]){
        NSTask *task = [[NSTask alloc] init];
        task.launchPath = @"/usr/bin/open";
        task.arguments = @[@"-a",@"QuickTime Player",eventData];
        [task launch];
    }else if([eventName isEqualToString:@"baiduyun-downloadURL"]){
        NSLog(@"Download Data: %@",eventData);
        NSArray *eventArr = [eventData componentsSeparatedByString:@"_BL_SPLIT_"];
        [self CallAria2Download:eventArr[0] fileName:eventArr[1]];
    }
    
    return NULL;
}

- (void)openSettings{
    NSLog(@"Show baiduyun settings");
    dispatch_async(dispatch_get_main_queue(), ^(void){
        
        NSString *path = [[NSBundle bundleForClass:[self class]]
                          pathForResource:@"Settings" ofType:@"nib"];
        settingsPanel =[[NSWindowController alloc] initWithWindowNibPath:path owner:self];
        [settingsPanel showWindow:self];
    });
    return;
}


@end

