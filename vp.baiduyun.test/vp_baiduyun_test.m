//
//  vp_baiduyun_test.m
//  vp.baiduyun.test
//
//  Created by TYPCN on 2015/9/26.
//  Copyright © 2015 TYPCN. All rights reserved.
//

#import <XCTest/XCTest.h>
#import "baiduyun.h"

@interface vp_baiduyun_test : XCTestCase{
    baiduyun *bdy;
}

@end

@implementation vp_baiduyun_test

- (void)setUp {
    [super setUp];
    bdy = [[baiduyun alloc] init];
}

- (void)tearDown {
    // Put teardown code here. This method is called after the invocation of each test method in the class.
    [super tearDown];
}

- (void)testBaiduyun {
    
    XCTestExpectation *expectation = [self expectationWithDescription:@"Testing Baiduyun"];
    
    
    [bdy processEvent:@"baiduyun-playURL" :@"http://d.pcs.baidu.com/file/0B517ABDD08C423BBB0B34B59254C6EF?fid=235624306-250528-484808514100220&time=1443261374&rt=pr&sign=FDTAER-DCb740ccc5511e5e8fedcff06b081203-o%2bF6vLJaCv3UZhosiheFcjzs8NI%3d&expires=8h&chkbd=0&chkv=0&dp-logid=6233010369379366984&dp-callid=0&r=861370092"];
    
    [self waitForExpectationsWithTimeout:30.0 handler:^(NSError *error) {
        
        if(error)
        {
            XCTFail(@"Expectation Failed with error: %@", error);
        }
        
    }];
}

@end
